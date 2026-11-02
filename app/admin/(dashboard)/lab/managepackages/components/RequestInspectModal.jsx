"use client";
import React from 'react';
import {
    X,
    FlaskConical,
    PackageCheck,
    Building2,
    Calendar,
    Tag,
    Clock,
    TestTube2,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Sparkles,
    Mail,
    Phone,
    User,
    Percent,
    AlertCircle
} from 'lucide-react';

export default function RequestInspectModal({ request, onClose, onApprove, onReject }) {
    if (!request) return null;

    const isTest = request.requestType === 'Test';
    const data = request.data || {};
    const vendor = request.vendorId || {};
    const tests = Array.isArray(data.tests) ? data.tests : [];

    // Calculate sum of individual test standardMRPs
    const sumIndividualMRP = tests.reduce((acc, t) => {
        return acc + (typeof t === 'object' && t?.standardMRP ? Number(t.standardMRP) : 0);
    }, 0);

    const proposedMRP = Number(data.standardMRP || 0);
    const bundleSavings = sumIndividualMRP > proposedMRP ? sumIndividualMRP - proposedMRP : 0;
    const discountPercent = sumIndividualMRP > 0 && bundleSavings > 0
        ? Math.round((bundleSavings / sumIndividualMRP) * 100)
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

                {/* --- HEADER --- */}
                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isTest ? 'bg-indigo-50 text-[#3d3f96]' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                        {isTest ? <FlaskConical size={24} /> : <PackageCheck size={24} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Vendor Proposed {request.requestType} Specification
                            </span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                Pending Review
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                            {data.packageName || data.testName}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    
                    {/* --- LEFT COLUMN: VENDOR & FINANCIAL PROFILE --- */}
                    <div className="md:col-span-1 space-y-4">
                        
                        {/* Vendor Contact Card */}
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2.5">
                            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                                Submitting Laboratory
                            </span>

                            <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-[#3d3f96] shrink-0" />
                                <p className="text-xs font-black text-slate-800">{vendor.name || "Mudabirs Lab"}</p>
                            </div>

                            {vendor.email && (
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                    <Mail size={13} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{vendor.email}</span>
                                </div>
                            )}

                            {vendor.phone && (
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                    <Phone size={13} className="text-slate-400 shrink-0" />
                                    <span>{vendor.phone}</span>
                                </div>
                            )}

                            <div className="pt-2 border-t border-slate-200/50">
                                <span className="text-[10px] font-mono text-slate-400 select-all block">
                                    Vendor ID: {vendor._id}
                                </span>
                            </div>
                        </div>

                        {/* Pricing & Savings Breakdown */}
                        <div className="bg-indigo-50/40 border border-indigo-100/60 p-4 rounded-2xl space-y-3">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Proposed Package MRP
                                </span>
                                <p className="text-2xl font-black text-slate-900 mt-0.5">
                                    ₹ {proposedMRP.toLocaleString('en-IN')}
                                </p>
                            </div>

                            {sumIndividualMRP > 0 && (
                                <div className="border-t border-indigo-100/80 pt-2 space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-semibold">Sum of Tests:</span>
                                        <span className="font-bold text-slate-600 line-through">
                                            ₹ {sumIndividualMRP.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    {discountPercent > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-semibold">Bundle Benefit:</span>
                                            <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                                                {discountPercent}% OFF (Save ₹{bundleSavings})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submission Metadata */}
                        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-xs space-y-1">
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Submission Timestamp</span>
                            <p className="font-bold text-slate-700 flex items-center gap-1.5">
                                <Calendar size={12} className="text-slate-400" />
                                {new Date(request.createdAt).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                })}
                                <span className="text-slate-400 font-normal">
                                    at {new Date(request.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* --- MIDDLE & RIGHT: SPECIFICATIONS & POPULATED TESTS --- */}
                    <div className="md:col-span-2 space-y-5 border-l border-slate-100 pl-0 md:pl-6">
                        
                        {/* Classification Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400">Main Classification</p>
                                <p className="text-xs font-black text-slate-800 mt-0.5">{data.mainCategory || "General"}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400">Subcategory</p>
                                <p className="text-xs font-black text-slate-800 mt-0.5">{data.category || "Standard"}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400">Turnaround Time</p>
                                <p className="text-xs font-black text-slate-800 mt-0.5 flex items-center gap-1">
                                    <Clock size={11} className="text-slate-400" /> {data.reportTime || "24 Hours"}
                                </p>
                            </div>
                        </div>

                        {/* Operational Demographics */}
                        <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-slate-500 font-semibold flex items-center gap-1">
                                    <User size={12} /> Gender:
                                </span>
                                <span className="font-bold text-slate-800">{data.gender || "Both"}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-slate-500 font-semibold flex items-center gap-1">
                                    <Tag size={12} /> Age Group:
                                </span>
                                <span className="font-bold text-slate-800">{data.ageGroup || "All"}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-slate-500 font-semibold">Fasting:</span>
                                <span className={`font-bold ${data.isFastingRequired ? 'text-amber-700' : 'text-slate-700'}`}>
                                    {data.isFastingRequired ? "Required" : "Not Required"}
                                </span>
                            </div>
                        </div>

                        {/* Specimen / Sample Types */}
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1">
                                <TestTube2 size={12} className="text-rose-500" /> Required Sample Specimen Types
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {Array.isArray(data.sampleTypes) && data.sampleTypes.length > 0 ? (
                                    data.sampleTypes.map((sample, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg"
                                        >
                                            <TestTube2 size={11} /> {sample}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs font-semibold text-slate-500">Serum / Blood</span>
                                )}
                            </div>
                        </div>

                        {/* --- POPULATED INCLUDED TESTS TABLE --- */}
                        {!isTest && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                        <Sparkles size={12} className="text-[#3d3f96]" /> Included Tests ({tests.length})
                                    </p>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        Baseline Catalog MRPs
                                    </span>
                                </div>

                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                                    {tests.length > 0 ? (
                                        tests.map((test, idx) => {
                                            const isPopulated = typeof test === 'object' && test !== null;
                                            const testName = isPopulated ? test.testName : `Test ID: ${test}`;
                                            const testCode = isPopulated ? test.testCode : null;
                                            const category = isPopulated ? test.mainCategory : null;
                                            const sample = isPopulated ? test.sampleType : null;
                                            const mrp = isPopulated && test.standardMRP ? Number(test.standardMRP) : null;

                                            return (
                                                <div
                                                    key={test._id || idx}
                                                    className="bg-slate-50 border border-slate-100 hover:border-slate-200 p-3 rounded-2xl flex items-center justify-between transition-all"
                                                >
                                                    <div className="space-y-0.5 max-w-[320px]">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-slate-800 truncate" title={testName}>
                                                                {testName}
                                                            </span>
                                                            {testCode && (
                                                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                                                                    {testCode}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                                                            {category && <span>{category}</span>}
                                                            {category && sample && <span>•</span>}
                                                            {sample && <span>Sample: {sample}</span>}
                                                        </div>
                                                    </div>

                                                    {mrp !== null && (
                                                        <div className="text-right shrink-0">
                                                            <span className="text-xs font-black text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                                                                ₹ {mrp.toLocaleString('en-IN')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No tests bundled in this package request.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* If single test proposal */}
                        {isTest && data.parameters && data.parameters.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1.5">
                                    Proposed Clinical Parameters ({data.parameters.length})
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {data.parameters.map((param, i) => (
                                        <span key={i} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                                            {param}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* --- FOOTER ACTION BUTTONS --- */}
                <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => onReject(request)}
                        className="py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <XCircle size={15} /> Reject Proposal
                    </button>
                    <button
                        type="button"
                        onClick={() => onApprove(request)}
                        className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <CheckCircle2 size={15} /> Approve & Publish to Master
                    </button>
                </div>

            </div>
        </div>
    );
}