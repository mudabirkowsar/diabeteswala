"use client";
import React from 'react';
import {
    PackageCheck,
    X,
    TestTube2,
    Clock,
    Tag,
    User,
    ShieldAlert,
    CheckCircle2,
    FileText,
    HelpCircle,
    Sparkles
} from 'lucide-react';

export default function PackageDetailsModal({ pkg, onClose }) {
    if (!pkg) return null;

    // Calculate sum of individual test standardMRPs
    const tests = Array.isArray(pkg.tests) ? pkg.tests : [];
    const sumIndividualMRP = tests.reduce((acc, t) => {
        return acc + (typeof t === 'object' && t?.standardMRP ? Number(t.standardMRP) : 0);
    }, 0);

    const discountAmount = sumIndividualMRP > pkg.standardMRP ? sumIndividualMRP - pkg.standardMRP : 0;
    const discountPercent = sumIndividualMRP > 0 && discountAmount > 0 
        ? Math.round((discountAmount / sumIndividualMRP) * 100) 
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[88vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
                        <PackageCheck size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Master Diagnostic Package</span>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">{pkg.packageName}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

                    {/* Left Column: Pricing, Savings & Verification */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-3">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Package Base Price</p>
                                <p className="text-2xl font-black text-slate-800 mt-0.5">
                                    ₹ {Number(pkg.standardMRP || 0).toLocaleString('en-IN')}
                                </p>
                            </div>

                            {sumIndividualMRP > 0 && (
                                <div className="border-t border-slate-200/50 pt-2 space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-semibold">Sum of Tests:</span>
                                        <span className="font-bold text-slate-600 line-through">₹ {sumIndividualMRP.toLocaleString('en-IN')}</span>
                                    </div>
                                    {discountPercent > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-semibold">Bundle Savings:</span>
                                            <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">
                                                {discountPercent}% OFF
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">System Record ID</p>
                                <p className="text-[11px] font-mono text-slate-500 select-all mt-0.5">{pkg._id}</p>
                            </div>
                        </div>

                        {/* Constraints Card */}
                        <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-2 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><User size={13} className="text-slate-400" /> Target Gender</span>
                                <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px]">{pkg.gender || "Both"}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><Tag size={13} className="text-slate-400" /> Age Bracket</span>
                                <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px]">{pkg.ageGroup || "All"}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> Report Turnaround</span>
                                <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px]">{pkg.reportTime || "24 Hours"}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-slate-400" /> Catalog Active</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] ${pkg.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                    {pkg.isActive !== false ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Clinical Overview & Samples */}
                    <div className="md:col-span-1 space-y-4 border-r border-slate-100 pr-0 md:pr-4">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Classification</p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">{pkg.category || "Full Body Checkup"}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">{pkg.mainCategory || "Pathology"}</p>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Required Specimen Types</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {Array.isArray(pkg.sampleTypes) && pkg.sampleTypes.length > 0 ? (
                                    pkg.sampleTypes.map((sample, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">
                                            <TestTube2 size={11} /> {sample}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-500 font-semibold">Blood, Urine</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Fasting Requirement</p>
                            {pkg.isFastingRequired ? (
                                <div className="text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-100 mt-1">
                                    Fasting Required: {pkg.fastingDuration || "10-12 Hours"}
                                </div>
                            ) : (
                                <p className="text-xs font-bold text-slate-600 mt-1">No mandatory overnight fasting required.</p>
                            )}
                        </div>

                        {pkg.shortDescription && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Summary</p>
                                <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                                    {pkg.shortDescription}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Populated Included Tests */}
                    <div className="md:col-span-1 space-y-3">
                        <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                            <Sparkles size={12} className="text-[#3d3f96]" /> Included Tests ({tests.length})
                        </p>
                        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                            {tests.length > 0 ? (
                                tests.map((t, idx) => {
                                    const isPopulated = typeof t === 'object' && t !== null;
                                    const testTitle = isPopulated ? t.testName : `Test ID: ${t}`;
                                    const mrp = isPopulated && t.standardMRP ? `₹${t.standardMRP}` : null;
                                    const sample = isPopulated && t.sampleType ? t.sampleType : null;

                                    return (
                                        <div key={idx} className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between">
                                            <div className="max-w-[170px]">
                                                <p className="text-xs font-bold text-slate-800 truncate" title={testTitle}>
                                                    {testTitle}
                                                </p>
                                                {sample && (
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                        {sample}
                                                    </span>
                                                )}
                                            </div>
                                            {mrp && (
                                                <span className="text-xs font-black text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-100">
                                                    {mrp}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-slate-400 italic">No tests attached to this package.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Preparations List */}
                {Array.isArray(pkg.preparations) && pkg.preparations.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100 text-left">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                            <ShieldAlert size={13} className="text-[#3d3f96]" /> Patient Pre-Test Preparations
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 font-medium">
                            {pkg.preparations.map((prep, i) => (
                                <li key={i}>{prep}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Detailed Description Sections */}
                {Array.isArray(pkg.detailedDescription) && pkg.detailedDescription.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <FileText size={13} className="text-[#3d3f96]" /> Clinical Package Specifications
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pkg.detailedDescription.map((sec, idx) => (
                                <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-800">{sec.sectionTitle}</p>
                                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                                        {sec.sectionContent}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FAQs */}
                {Array.isArray(pkg.faqs) && pkg.faqs.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <HelpCircle size={13} className="text-[#3d3f96]" /> Frequently Asked Questions
                        </h4>
                        <div className="space-y-2">
                            {pkg.faqs.map((faq, idx) => (
                                <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
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