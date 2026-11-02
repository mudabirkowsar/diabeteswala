"use client";
import React from 'react';
import {
    PackageCheck,
    X,
    TestTube2,
    Clock,
    Tag,
    ShieldAlert,
    CheckCircle2,
    Sparkles,
    User,
    FileText
} from 'lucide-react';

export default function CustomPackageDetailsModal({ pkg, onClose }) {
    if (!pkg) return null;

    const tests = Array.isArray(pkg.tests) ? pkg.tests : [];
    const mrp = Number(pkg.mrp || 0);
    const discount = Number(pkg.discountPercent || 0);
    const offerPrice = pkg.offerPrice !== undefined ? Number(pkg.offerPrice) : Math.round(mrp - (mrp * (discount / 100)));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Custom Health Package Sheet</span>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">{pkg.packageName}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {/* Left: Pricing & Status */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400">Patient Offer Price</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-800">₹ {offerPrice}</span>
                                {discount > 0 && (
                                    <span className="text-xs font-semibold text-slate-400 line-through">₹ {mrp}</span>
                                )}
                            </div>
                            {discount > 0 && (
                                <span className="inline-block text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    {discount}% Package Discount
                                </span>
                            )}
                        </div>

                        {/* Operational Card */}
                        <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-2 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> Report Turnaround</span>
                                <span>{pkg.reportTime || "12 Hours"}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><User size={13} className="text-slate-400" /> Target Gender</span>
                                <span>{pkg.gender || "Both"}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><Tag size={13} className="text-slate-400" /> Age Group</span>
                                <span>{pkg.ageGroup || "All"}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-slate-400" /> Status</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] ${pkg.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                    {pkg.isActive !== false ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Clinical Attributes & Specimens */}
                    <div className="md:col-span-2 space-y-4 border-l border-slate-100 pl-0 md:pl-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Classification</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{pkg.mainCategory || "Clinical Pathology"}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{pkg.category || "Diabetic Screening"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Resolved Specimen Types</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {Array.isArray(pkg.sampleTypes) && pkg.sampleTypes.length > 0 ? (
                                        pkg.sampleTypes.map((sample, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">
                                                <TestTube2 size={11} /> {sample}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-500 font-semibold">Standard Specimen</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fasting / Precaution */}
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                <ShieldAlert size={12} className="text-[#3d3f96]" /> Patient Instructions & Fasting
                            </p>
                            <div className="text-xs font-semibold text-slate-600 mt-1 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50 space-y-1">
                                {pkg.isFastingRequired && (
                                    <p className="font-bold text-amber-800">
                                        Fasting: {pkg.fastingDuration || "Overnight Fasting Required"}
                                    </p>
                                )}
                                <p>{pkg.precaution || "No specific pre-test preparation required."}</p>
                            </div>
                        </div>

                        {/* Included Tests */}
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                                <Sparkles size={12} className="text-[#3d3f96]" /> Included Diagnostic Tests ({tests.length})
                            </p>
                            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                                {tests.length > 0 ? (
                                    tests.map((t, idx) => {
                                        const isObj = typeof t === 'object' && t !== null;
                                        const testName = isObj ? t.testName : `Test ID: ${t}`;
                                        const sample = isObj ? t.sampleType : null;

                                        return (
                                            <div key={idx} className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-800 truncate">{testName}</span>
                                                {sample && (
                                                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                                                        {sample}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No tests bundled.</p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {pkg.description && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                    <FileText size={12} className="text-[#3d3f96]" /> Clinical Package Summary
                                </p>
                                <p className="text-xs font-medium text-slate-600 mt-1">
                                    {pkg.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}