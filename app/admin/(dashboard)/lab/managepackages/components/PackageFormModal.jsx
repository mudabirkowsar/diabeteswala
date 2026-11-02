"use client";
import React, { useState, useEffect } from 'react';
import {
    X,
    Plus,
    Trash2,
    Loader2,
    PackagePlus,
    Search,
    Check,
    TestTube2,
    Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminAPI from '../../../../../services/AdminAPI';

export default function PackageFormModal({ isOpen, editData, onClose, onSuccess }) {
    const [actionLoading, setActionLoading] = useState(false);

    // Available Master Tests for linking
    const [availableTests, setAvailableTests] = useState([]);
    const [testsLoading, setTestsLoading] = useState(false);
    const [testSearchQuery, setTestSearchQuery] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        packageName: '',
        mainCategory: 'Pathology',
        category: 'Full Body Checkup',
        standardMRP: '',
        shortDescription: '',
        longDescription: '',
        reportTime: '24 Hours',
        gender: 'Both',
        ageGroup: 'All',
        isFastingRequired: false,
        fastingDuration: '10-12 Hours',
        isActive: true,
        tests: [],          // array of test _id strings
        sampleTypes: ['Blood'],
        tags: [],
        preparations: [],
        faqs: [],
        detailedDescription: []
    });

    // Inputs for dynamic chip additions
    const [newTag, setNewTag] = useState("");
    const [newPrep, setNewPrep] = useState("");
    const [newSample, setNewSample] = useState("");

    // --- Load Master Tests for linking ---
    useEffect(() => {
        if (!isOpen) return;

        const loadMasterTests = async () => {
            setTestsLoading(true);
            try {
                // Fetch tests catalogue (page 1 returns up to 20 tests)
                const res = await AdminAPI.getMasterTestsList(1);
                if (res && res.success) {
                    setAvailableTests(res.data || []);
                }
            } catch (err) {
                console.error("Could not fetch master tests for linking:", err);
            } finally {
                setTestsLoading(false);
            }
        };

        loadMasterTests();
    }, [isOpen]);

    // --- Sync Form Data when opening in Create or Edit Mode ---
    useEffect(() => {
        if (!isOpen) return;

        if (editData) {
            // Extract IDs from tests (they can be objects if populated, or plain IDs)
            const extractedTestIds = Array.isArray(editData.tests)
                ? editData.tests.map(t => (typeof t === 'object' && t !== null ? t._id : t))
                : [];

            setFormData({
                packageName: editData.packageName || '',
                mainCategory: editData.mainCategory || 'Pathology',
                category: editData.category || 'Full Body Checkup',
                standardMRP: editData.standardMRP !== undefined ? editData.standardMRP : '',
                shortDescription: editData.shortDescription || '',
                longDescription: editData.longDescription || '',
                reportTime: editData.reportTime || '24 Hours',
                gender: editData.gender || 'Both',
                ageGroup: editData.ageGroup || 'All',
                isFastingRequired: Boolean(editData.isFastingRequired),
                fastingDuration: editData.fastingDuration || '10-12 Hours',
                isActive: editData.isActive !== false,
                tests: extractedTestIds,
                sampleTypes: Array.isArray(editData.sampleTypes) ? [...editData.sampleTypes] : ['Blood'],
                tags: Array.isArray(editData.tags) ? [...editData.tags] : [],
                preparations: Array.isArray(editData.preparations) ? [...editData.preparations] : [],
                faqs: Array.isArray(editData.faqs) ? editData.faqs.map(f => ({ question: f.question, answer: f.answer })) : [],
                detailedDescription: Array.isArray(editData.detailedDescription)
                    ? editData.detailedDescription.map(d => ({ sectionTitle: d.sectionTitle, sectionContent: d.sectionContent }))
                    : []
            });
        } else {
            // Reset to clean Create defaults
            setFormData({
                packageName: '',
                mainCategory: 'Pathology',
                category: 'Full Body Checkup',
                standardMRP: '',
                shortDescription: '',
                longDescription: '',
                reportTime: '24 Hours',
                gender: 'Both',
                ageGroup: 'All',
                isFastingRequired: false,
                fastingDuration: '10-12 Hours',
                isActive: true,
                tests: [],
                sampleTypes: ['Blood'],
                tags: ['Full Body', 'Preventive Health'],
                preparations: [],
                faqs: [],
                detailedDescription: []
            });
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    // --- Test Selection Toggles ---
    const handleToggleTest = (testId) => {
        setFormData(prev => {
            const exists = prev.tests.includes(testId);
            return {
                ...prev,
                tests: exists ? prev.tests.filter(id => id !== testId) : [...prev.tests, testId]
            };
        });
    };

    // --- Dynamic Chips: Tags ---
    const handleAddTag = () => {
        if (!newTag.trim()) return;
        if (!formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
        }
        setNewTag("");
    };

    const handleRemoveTag = (idx) => {
        setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) });
    };

    // --- Dynamic Chips: Samples ---
    const handleAddSample = () => {
        if (!newSample.trim()) return;
        if (!formData.sampleTypes.includes(newSample.trim())) {
            setFormData({ ...formData, sampleTypes: [...formData.sampleTypes, newSample.trim()] });
        }
        setNewSample("");
    };

    const handleRemoveSample = (idx) => {
        setFormData({ ...formData, sampleTypes: formData.sampleTypes.filter((_, i) => i !== idx) });
    };

    // --- Dynamic Chips: Preparations ---
    const handleAddPrep = () => {
        if (!newPrep.trim()) return;
        setFormData({ ...formData, preparations: [...formData.preparations, newPrep.trim()] });
        setNewPrep("");
    };

    const handleRemovePrep = (idx) => {
        setFormData({ ...formData, preparations: formData.preparations.filter((_, i) => i !== idx) });
    };

    // --- FAQs & Sections ---
    const handleAddFaq = () => {
        setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
    };

    const handleFaqChange = (index, field, value) => {
        const updated = [...formData.faqs];
        updated[index][field] = value;
        setFormData({ ...formData, faqs: updated });
    };

    const handleRemoveFaq = (index) => {
        setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== index) });
    };

    const handleAddSection = () => {
        setFormData({
            ...formData,
            detailedDescription: [...formData.detailedDescription, { sectionTitle: '', sectionContent: '' }]
        });
    };

    const handleSectionChange = (index, field, value) => {
        const updated = [...formData.detailedDescription];
        updated[index][field] = value;
        setFormData({ ...formData, detailedDescription: updated });
    };

    const handleRemoveSection = (index) => {
        setFormData({
            ...formData,
            detailedDescription: formData.detailedDescription.filter((_, i) => i !== index)
        });
    };

    // --- Form Submission Handler ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.packageName.trim()) {
            toast.error("Package name is required.");
            return;
        }

        if (formData.tests.length === 0) {
            toast.error("Please select at least 1 diagnostic test to link with this package.");
            return;
        }

        if (!formData.standardMRP || Number(formData.standardMRP) <= 0) {
            toast.error("Please enter a valid standard MRP.");
            return;
        }

        setActionLoading(true);
        try {
            const cleanPayload = {
                packageName: formData.packageName.trim(),
                mainCategory: formData.mainCategory.trim(),
                category: formData.category.trim(),
                standardMRP: Number(formData.standardMRP),
                shortDescription: formData.shortDescription.trim(),
                longDescription: formData.longDescription.trim(),
                reportTime: formData.reportTime.trim(),
                gender: formData.gender,
                ageGroup: formData.ageGroup,
                isFastingRequired: Boolean(formData.isFastingRequired),
                fastingDuration: formData.fastingDuration.trim(),
                isActive: Boolean(formData.isActive),
                tests: formData.tests,
                sampleTypes: formData.sampleTypes,
                tags: formData.tags,
                preparations: formData.preparations,
                faqs: formData.faqs.filter(f => f.question.trim() && f.answer.trim()),
                detailedDescription: formData.detailedDescription.filter(d => d.sectionTitle.trim() && d.sectionContent.trim())
            };

            let response;
            if (editData?._id) {
                // Edit PUT /admin/lab/tests/edit/package/:id
                response = await AdminAPI.editMasterPackage(editData._id, cleanPayload);
            } else {
                // Create POST /admin/lab/tests/create with { type: 'package', payload: cleanPayload }
                response = await AdminAPI.createMasterPackage(cleanPayload);
            }

            if (response && response.success) {
                toast.success(editData ? "Package updated successfully!" : "Master package created successfully!");
                onSuccess();
            } else {
                toast.error(response?.message || "Failed to save health package.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred while saving the package.");
        } finally {
            setActionLoading(false);
        }
    };

    // Test search filter inside modal
    const filteredAvailableTests = availableTests.filter(t => {
        if (!testSearchQuery.trim()) return true;
        const q = testSearchQuery.toLowerCase();
        return t.testName?.toLowerCase().includes(q) || t.testCode?.toLowerCase().includes(q);
    });

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

                <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                    <PackagePlus className="text-[#3d3f96]" size={22} />
                    {editData ? "Edit Master Health Package" : "Configure New Master Health Package"}
                </h2>

                <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
                    
                    {/* Package Title & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Package Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.packageName}
                                onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                placeholder="e.g. Comprehensive Full Body Checkup - Platinum"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Standard MRP (₹) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.standardMRP}
                                onChange={(e) => setFormData({ ...formData, standardMRP: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                placeholder="1999"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Main Category</label>
                            <input
                                type="text"
                                value={formData.mainCategory}
                                onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                placeholder="Pathology"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Sub Category</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                placeholder="Full Body Checkup / Diabetes"
                            />
                        </div>
                    </div>

                    {/* --- TEST SELECTOR / ATTACH TESTS --- */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
                                <Sparkles size={12} className="text-[#3d3f96]" /> Link Diagnostic Tests ({formData.tests.length} Selected) *
                            </label>
                            <span className="text-[10px] font-bold text-slate-400">Click to select/unselect</span>
                        </div>

                        {/* Search tests in dropdown */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search tests by name or code..."
                                value={testSearchQuery}
                                onChange={(e) => setTestSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                            />
                        </div>

                        {/* Tests List Box */}
                        <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-2xl p-2 bg-slate-50/50 space-y-1.5">
                            {testsLoading ? (
                                <div className="py-4 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Loading Master Tests Catalogue...
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
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded flex items-center justify-center border text-white ${isSelected ? 'bg-[#3d3f96] border-[#3d3f96]' : 'border-slate-300'}`}>
                                                    {isSelected && <Check size={12} />}
                                                </div>
                                                <span className="text-xs font-bold">{test.testName}</span>
                                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                                                    {test.testCode || test.sampleType || "Pathology"}
                                                </span>
                                            </div>
                                            <span className="text-xs font-black text-slate-600">
                                                ₹ {test.standardMRP || 0}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-3">No matching tests found in database.</p>
                            )}
                        </div>
                    </div>

                    {/* Specifications: Turnaround, Demographics & Fasting */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
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
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Age Group</label>
                            <select
                                value={formData.ageGroup}
                                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#3d3f96] cursor-pointer"
                            >
                                <option value="All">All</option>
                                <option value="Adults">Adults</option>
                                <option value="Senior Citizen">Senior Citizen</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
                            <select
                                value={formData.isActive ? "true" : "false"}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#3d3f96] cursor-pointer"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Fasting Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="fastingCheck"
                                checked={formData.isFastingRequired}
                                onChange={(e) => setFormData({ ...formData, isFastingRequired: e.target.checked })}
                                className="w-4 h-4 rounded text-[#3d3f96] cursor-pointer"
                            />
                            <label htmlFor="fastingCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
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

                    {/* Dynamic Samples & Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sample Types */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Specimen Types (e.g. Blood, Urine)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSample}
                                    onChange={(e) => setNewSample(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSample(); } }}
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                    placeholder="Add sample..."
                                />
                                <button type="button" onClick={handleAddSample} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold cursor-pointer">
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {formData.sampleTypes.map((sample, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">
                                        {sample}
                                        <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => handleRemoveSample(i)} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Search Tags */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Search & Filter Tags</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                    placeholder="Add tag..."
                                />
                                <button type="button" onClick={handleAddTag} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold cursor-pointer">
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {formData.tags.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-indigo-50 text-[#3d3f96] rounded-lg border border-indigo-100">
                                        {tag}
                                        <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => handleRemoveTag(i)} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Short Description */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Short Description</label>
                        <textarea
                            rows={2}
                            value={formData.shortDescription}
                            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#3d3f96] resize-none"
                            placeholder="Brief summary e.g. Includes 60+ vital parameters covering heart, liver, thyroid..."
                        />
                    </div>

                    {/* Pre-test Instructions */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Patient Instructions / Preparations</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newPrep}
                                onChange={(e) => setNewPrep(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPrep(); } }}
                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                placeholder="e.g. Avoid alcohol for 24 hours prior..."
                            />
                            <button type="button" onClick={handleAddPrep} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold cursor-pointer">
                                <Plus size={14} />
                            </button>
                        </div>
                        <ul className="space-y-1 mt-1">
                            {formData.preparations.map((prep, i) => (
                                <li key={i} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600">
                                    <span>{prep}</span>
                                    <button type="button" onClick={() => handleRemovePrep(i)} className="text-slate-400 hover:text-red-500">
                                        <X size={12} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* FAQs */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Frequently Asked Questions</label>
                            <button
                                type="button"
                                onClick={handleAddFaq}
                                className="text-[10px] font-bold text-[#3d3f96] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <Plus size={12} /> Add FAQ Item
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.faqs.map((faq, idx) => (
                                <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 relative">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFaq(idx)}
                                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Question"
                                        value={faq.question}
                                        onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                    />
                                    <textarea
                                        rows={2}
                                        placeholder="Answer"
                                        value={faq.answer}
                                        onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 outline-none resize-none"
                                    />
                                </div>
                            ))}
                        </div>
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
                                <span>{editData ? "Update Master Package" : "Create Master Package"}</span>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}