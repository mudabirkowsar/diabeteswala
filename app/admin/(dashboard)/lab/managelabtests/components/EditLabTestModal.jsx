"use client";
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, FlaskConical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminAPI from '../../../../../services/AdminAPI';

export default function EditLabTestModal({ isOpen, testData, onClose, onSuccess }) {
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        testName: '',
        testCode: '',
        mainCategory: '',
        category: '',
        sampleType: '',
        gender: 'Both',
        pretestPreparation: '',
        standardMRP: '',
        isActive: true,
        parameters: [],
        faqs: [],
        detailedDescription: []
    });

    const [newParameter, setNewParameter] = useState("");

    useEffect(() => {
        if (!isOpen || !testData) return;

        setFormData({
            testName: testData.testName || '',
            testCode: testData.testCode || '',
            mainCategory: testData.mainCategory || '',
            category: testData.category || '',
            sampleType: testData.sampleType || '',
            gender: testData.gender || 'Both',
            pretestPreparation: testData.pretestPreparation || '',
            standardMRP: testData.standardMRP !== undefined ? testData.standardMRP : '',
            isActive: testData.isActive !== false,
            parameters: Array.isArray(testData.parameters) ? [...testData.parameters] : [],
            faqs: Array.isArray(testData.faqs) ? testData.faqs.map(f => ({ question: f.question, answer: f.answer })) : [],
            detailedDescription: Array.isArray(testData.detailedDescription)
                ? testData.detailedDescription.map(d => ({ sectionTitle: d.sectionTitle, sectionContent: d.sectionContent }))
                : []
        });
    }, [isOpen, testData]);

    if (!isOpen || !testData) return null;

    // --- Parameter Add / Remove ---
    const handleAddParameter = () => {
        if (!newParameter.trim()) return;
        setFormData({
            ...formData,
            parameters: [...formData.parameters, newParameter.trim()]
        });
        setNewParameter("");
    };

    const handleRemoveParameter = (idx) => {
        setFormData({
            ...formData,
            parameters: formData.parameters.filter((_, i) => i !== idx)
        });
    };

    // --- FAQ Add / Update / Remove ---
    const handleAddFaq = () => {
        setFormData({
            ...formData,
            faqs: [...formData.faqs, { question: '', answer: '' }]
        });
    };

    const handleFaqChange = (index, field, value) => {
        const updated = [...formData.faqs];
        updated[index][field] = value;
        setFormData({ ...formData, faqs: updated });
    };

    const handleRemoveFaq = (index) => {
        setFormData({
            ...formData,
            faqs: formData.faqs.filter((_, i) => i !== index)
        });
    };

    // --- Description Sections Add / Update / Remove ---
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

    // --- Submit Routine ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.testName.trim()) {
            toast.error("Test name is required.");
            return;
        }

        setActionLoading(true);
        try {
            const payload = {
                testName: formData.testName,
                mainCategory: formData.mainCategory,
                category: formData.category,
                sampleType: formData.sampleType,
                gender: formData.gender,
                pretestPreparation: formData.pretestPreparation,
                standardMRP: Number(formData.standardMRP) || 0,
                isActive: Boolean(formData.isActive),
                parameters: formData.parameters,
                faqs: formData.faqs.filter(f => f.question.trim() && f.answer.trim()),
                detailedDescription: formData.detailedDescription.filter(d => d.sectionTitle.trim() && d.sectionContent.trim())
            };

            const response = await AdminAPI.editMasterTest(testData._id, payload);
            if (response && response.success) {
                toast.success(response.message || "Master test updated successfully.");
                onSuccess();
            } else {
                toast.error(response?.message || "Failed to update master test.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred while saving test data.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                    <X size={18} />
                </button>

                <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                    <FlaskConical className="text-[#3d3f96]" size={20} /> Edit Master Diagnostic Test
                </h2>

                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Test Name */}
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Test Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.testName}
                                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                placeholder="Complete Blood Count (CBC)"
                            />
                        </div>

                        {/* Test Code (Read-Only) */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Test Code</label>
                            <input
                                type="text"
                                disabled
                                value={formData.testCode}
                                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Main Category */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Main Category</label>
                            <input
                                type="text"
                                value={formData.mainCategory}
                                onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                placeholder="Pathology / Radiology"
                            />
                        </div>

                        {/* Sub Category */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Sub Category</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                placeholder="Fever / Diabetes"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Sample Type */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Sample Specimen</label>
                            <input
                                type="text"
                                value={formData.sampleType}
                                onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                placeholder="Blood / Urine"
                            />
                        </div>

                        {/* Gender */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="Both">Both</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        {/* Standard MRP */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Standard MRP (₹)</label>
                            <input
                                type="number"
                                step="1"
                                value={formData.standardMRP}
                                onChange={(e) => setFormData({ ...formData, standardMRP: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                placeholder="450"
                            />
                        </div>
                    </div>

                    {/* Pre-test Preparation */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Pre-Test Preparation Guidelines</label>
                        <input
                            type="text"
                            value={formData.pretestPreparation}
                            onChange={(e) => setFormData({ ...formData, pretestPreparation: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                            placeholder="e.g. 10-12 hours fasting required"
                        />
                    </div>

                    {/* Parameters Editor */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Test Parameters</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newParameter}
                                onChange={(e) => setNewParameter(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddParameter(); } }}
                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                placeholder="Add parameter (e.g. Platelet Count) and press Enter"
                            />
                            <button
                                type="button"
                                onClick={handleAddParameter}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2 max-h-32 overflow-y-auto">
                            {formData.parameters.map((param, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-50/60 text-[#3d3f96] px-2.5 py-1 rounded-lg border border-indigo-100/40">
                                    {param}
                                    <button type="button" onClick={() => handleRemoveParameter(idx)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
                        <select
                            value={formData.isActive ? "true" : "false"}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4">
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
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}