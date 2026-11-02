"use client";
import React from 'react';
import {
    FlaskConical,
    X,
    TestTube2,
    Tag,
    Layers,
    FileText,
    HelpCircle,
    CheckCircle2,
    XCircle,
    User
} from 'lucide-react';

export default function LabTestDetailsModal({ test, onClose }) {
    if (!test) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
                        <FlaskConical size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Master Lab Specimen Sheet</span>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">{test.testName}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    
                    {/* Left Column: Identifiers & Pricing */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-3">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Standard Test Code</p>
                                <p className="text-sm font-black text-[#3d3f96] mt-0.5 select-all">{test.testCode || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">System Document ID</p>
                                <p className="text-[11px] font-mono text-slate-600 mt-0.5 select-all">{test._id}</p>
                            </div>
                            <div className="border-t border-slate-200/50 pt-2">
                                <span className="text-slate-400 text-xs font-semibold block">Platform Baseline MRP</span>
                                <span className="font-black text-slate-800 text-lg">₹ {Number(test.standardMRP || 0).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Constraints */}
                        <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                <span className="flex items-center gap-1.5">
                                    <User size={13} className="text-slate-400" /> Target Gender
                                </span>
                                <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px]">
                                    {test.gender || "Both"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-slate-400" /> Catalog Status
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] ${test.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                    {test.isActive !== false ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Clinical Categorization */}
                    <div className="md:col-span-1 space-y-4 border-r border-slate-100 pr-0 md:pr-4">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Main Medical Classification</p>
                            <p className="text-xs font-bold text-slate-700 mt-0.5">{test.mainCategory || "Unspecified"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Sub-Category / Health Focus</p>
                            <p className="text-xs font-bold text-slate-700 mt-0.5">{test.category || "General Health"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Specimen / Sample Type</p>
                            <p className="text-xs font-bold text-rose-600 mt-0.5 flex items-center gap-1">
                                <TestTube2 size={13} /> {test.sampleType || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Pre-Test Preparation Guidelines</p>
                            <div className="text-xs font-semibold text-slate-600 mt-1 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
                                {test.pretestPreparation || "No special preparation instructions stated."}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Parameters List */}
                    <div className="md:col-span-1 space-y-3">
                        <p className="text-[10px] font-black uppercase text-slate-400">
                            Included Parameters ({Array.isArray(test.parameters) ? test.parameters.length : 0})
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                            {Array.isArray(test.parameters) && test.parameters.length > 0 ? (
                                test.parameters.map((param, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-block text-[11px] font-bold px-2.5 py-1 bg-slate-50 border border-slate-200/60 text-slate-700 rounded-lg"
                                    >
                                        {param}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic">No individual parameter entries listed.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Detailed Sections Block */}
                {Array.isArray(test.detailedDescription) && test.detailedDescription.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <FileText size={13} className="text-[#3d3f96]" /> Detailed Clinical Description
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {test.detailedDescription.map((sec, idx) => (
                                <div key={sec._id || idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-800">{sec.sectionTitle}</p>
                                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                                        {sec.sectionContent}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FAQs Block */}
                {Array.isArray(test.faqs) && test.faqs.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <HelpCircle size={13} className="text-[#3d3f96]" /> Frequently Asked Questions
                        </h4>
                        <div className="space-y-2">
                            {test.faqs.map((faq, idx) => (
                                <div key={faq._id || idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-800">Q: {faq.question}</p>
                                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                                        A: {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}