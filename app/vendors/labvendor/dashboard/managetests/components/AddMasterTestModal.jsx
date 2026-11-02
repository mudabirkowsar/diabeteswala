"use client";
import React, { useState, useEffect } from 'react';
import {
    X,
    Search,
    Loader2,
    FlaskConical,
    Sparkles,
    Check,
    Clock,
    Tag,
    ChevronRight,
    ArrowLeft,
    TestTube2,
    ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LabVendorAPI from '../../../../../services/LabVendorAPI';

export default function AddMasterTestModal({ isOpen, onClose, onSuccess }) {
    // Stage: 'browse' (Step 1) or 'configure' (Step 2 & 3)
    const [step, setStep] = useState('browse');

    // Step 1: Master Catalog states
    const [masterTests, setMasterTests] = useState([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    // Step 2 & 3: Selected Master Details & Vendor Pricing form
    const [selectedMaster, setSelectedMaster] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [formValues, setFormValues] = useState({
        amount: '',
        discountPercent: 0,
        reportTime: '24 Hours',
        testType: 'Both',
        precaution: '',
        description: ''
    });

    // Fetch master tests when modal opens or filter changes
    useEffect(() => {
        if (!isOpen) return;

        const loadMasterTests = async () => {
            setLoadingCatalog(true);
            try {
                const params = {};
                if (searchTerm.trim()) params.search = searchTerm.trim();
                if (selectedCategory) params.mainCategory = selectedCategory;

                const response = await LabVendorAPI.getMasterTests(params);
                if (response && response.success) {
                    setMasterTests(response.data || []);
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load platform master tests.");
            } finally {
                setLoadingCatalog(false);
            }
        };

        const timer = setTimeout(() => {
            loadMasterTests();
        }, 300);

        return () => clearTimeout(timer);
    }, [isOpen, searchTerm, selectedCategory]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep('browse');
            setSelectedMaster(null);
            setSearchTerm("");
            setSelectedCategory("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Step 2: Select a test and auto-fill details
    const handleSelectTest = async (testId) => {
        setLoadingDetails(true);
        try {
            const response = await LabVendorAPI.getMasterTestDetails(testId);
            if (response && response.success) {
                const m = response.data;
                setSelectedMaster(m);
                // Pre-fill vendor form with master defaults
                setFormValues({
                    amount: m.standardMRP || '',
                    discountPercent: 0,
                    reportTime: '24 Hours',
                    testType: 'Both',
                    precaution: m.pretestPreparation || '',
                    description: ''
                });
                setStep('configure');
            } else {
                toast.error("Failed to fetch test specification.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Could not load master test profile.");
        } finally {
            setLoadingDetails(false);
        }
    };

    // Live calculated discount price
    const numAmount = Number(formValues.amount) || 0;
    const numDiscount = Number(formValues.discountPercent) || 0;
    const calculatedDiscountPrice = Math.max(0, Math.round(numAmount - (numAmount * (numDiscount / 100))));

    // Step 3: Save to vendor inventory
    const handleSaveSubmit = async (e) => {
        e.preventDefault();

        if (!numAmount || numAmount <= 0) {
            toast.error("Please enter a valid MRP amount.");
            return;
        }

        if (numDiscount < 0 || numDiscount > 100) {
            toast.error("Discount percentage must be between 0% and 100%.");
            return;
        }

        setActionLoading(true);
        try {
            const payload = {
                masterTestId: selectedMaster._id,
                amount: numAmount,
                discountPercent: numDiscount,
                reportTime: formValues.reportTime,
                testType: formValues.testType,
                precaution: formValues.precaution,
                description: formValues.description
            };

            const response = await LabVendorAPI.saveLabTest(payload);
            if (response && response.success) {
                toast.success(response.message || "Test added to your lab inventory successfully!");
                onSuccess();
            } else {
                toast.error(response?.message || "Failed to add test to inventory.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred while linking the test.");
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

                {/* --- STAGE 1: BROWSE PLATFORM MASTER CATALOG --- */}
                {step === 'browse' ? (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Step 1 of 2</span>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Select Test from Platform Catalog</h2>
                            </div>
                        </div>

                        {/* Search & Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="md:col-span-2 relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search by test name or code (e.g. CBC, Glucose)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                />
                            </div>
                            <div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#3d3f96] cursor-pointer"
                                >
                                    <option value="">All Categories</option>
                                    <option value="Pathology">Pathology</option>
                                    <option value="Radiology">Radiology</option>
                                </select>
                            </div>
                        </div>

                        {/* Master Tests List */}
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                            {loadingCatalog ? (
                                <div className="py-16 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center">
                                    <Loader2 size={24} className="animate-spin text-[#3d3f96] mb-2" />
                                    Querying Master Test Catalog...
                                </div>
                            ) : masterTests.length > 0 ? (
                                masterTests.map((t) => (
                                    <div
                                        key={t._id}
                                        onClick={() => handleSelectTest(t._id)}
                                        className="p-3.5 rounded-2xl border border-slate-100 hover:border-[#3d3f96]/30 bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer flex items-center justify-between group"
                                    >
                                        <div className="space-y-1 max-w-[480px]">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#3d3f96]">
                                                    {t.testName}
                                                </h4>
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-[#3d3f96]">
                                                    {t.testCode || t.sampleType || "Pathology"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                                                <span>Category: {t.category || t.mainCategory}</span>
                                                <span>•</span>
                                                <span>Sample: {t.sampleType || "Blood"}</span>
                                                {t.parameters && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{t.parameters.length} Parameters</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Base MRP</span>
                                                <span className="text-xs font-extrabold text-slate-800">₹ {t.standardMRP || 0}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 group-hover:text-[#3d3f96] group-hover:border-[#3d3f96]/30 transition-all">
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 text-center text-xs text-slate-400 font-bold">
                                    No tests found matching your search.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* --- STAGE 2: CONFIGURE PRICING & TAT --- */
                    <div>
                        <button
                            type="button"
                            onClick={() => setStep('browse')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3d3f96] hover:underline mb-4 cursor-pointer"
                        >
                            <ArrowLeft size={14} /> Back to Catalog
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
                                <FlaskConical size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Step 2 of 2</span>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Configure Lab Pricing & Service</h2>
                            </div>
                        </div>

                        {/* Master Overview Card */}
                        {selectedMaster && (
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-5 space-y-2 text-left">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800">{selectedMaster.testName}</h3>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                                            {selectedMaster.mainCategory} • Specimen: {selectedMaster.sampleType || "Blood"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Platform Base MRP</span>
                                        <span className="text-xs font-black text-slate-700">₹ {selectedMaster.standardMRP || 0}</span>
                                    </div>
                                </div>
                                {selectedMaster.parameters && selectedMaster.parameters.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/50">
                                        {selectedMaster.parameters.map((p, i) => (
                                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Configuration Form */}
                        <form onSubmit={handleSaveSubmit} className="space-y-4 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Lab MRP */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Lab MRP (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formValues.amount}
                                        onChange={(e) => setFormValues({ ...formValues, amount: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white"
                                        placeholder="400"
                                    />
                                </div>

                                {/* Discount % */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Discount (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formValues.discountPercent}
                                        onChange={(e) => setFormValues({ ...formValues, discountPercent: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white"
                                        placeholder="10"
                                    />
                                </div>

                                {/* Final Discount Price Preview */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Calculated Patient Price</label>
                                    <div className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl text-xs font-black text-[#3d3f96]">
                                        ₹ {calculatedDiscountPrice}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Turnaround Time */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Report Turnaround Time</label>
                                    <input
                                        type="text"
                                        value={formValues.reportTime}
                                        onChange={(e) => setFormValues({ ...formValues, reportTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                        placeholder="e.g. 6 Hours, Same Day, 24 Hours"
                                    />
                                </div>

                                {/* Service Mode */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Type</label>
                                    <select
                                        value={formValues.testType}
                                        onChange={(e) => setFormValues({ ...formValues, testType: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#3d3f96] cursor-pointer"
                                    >
                                        <option value="Both">Both (Home Collection & Walk-In)</option>
                                        <option value="Home Collection">Home Collection Only</option>
                                        <option value="Walk-In">Walk-In Center Only</option>
                                    </select>
                                </div>
                            </div>

                            {/* Lab Specific Instructions */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Patient Instructions / Precautions</label>
                                <input
                                    type="text"
                                    value={formValues.precaution}
                                    onChange={(e) => setFormValues({ ...formValues, precaution: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                    placeholder="e.g. 10 hours fasting required. Drink plenty of water."
                                />
                            </div>

                            {/* Additional Laboratory Notes */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Lab Notes / Machine Spec (Optional)</label>
                                <textarea
                                    rows={2}
                                    value={formValues.description}
                                    onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-[#3d3f96] resize-none"
                                    placeholder="e.g. Analyzed using fully automated 5-part hematology analyzer."
                                />
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setStep('browse')}
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
                                        <span>Add to My Inventory</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}