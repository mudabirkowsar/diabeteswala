"use client";
import React from 'react';
import {
    FlaskConical,
    X,
    TestTube2,
    Clock,
    Tag,
    ShieldAlert,
    CheckCircle2,
    Home,
    Building2,
    FileText
} from 'lucide-react';

export default function VendorTestDetailsModal({ test, onClose }) {
    if (!test) return null;

    const master = typeof test.masterTestId === 'object' && test.masterTestId !== null ? test.masterTestId : null;
    const amount = Number(test.amount || 0);
    const discount = Number(test.discountPercent || 0);
    const finalPrice = test.discountPrice !== undefined ? Number(test.discountPrice) : Math.round(amount - (amount * (discount / 100)));

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
                        <FlaskConical size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Inventory Service Sheet</span>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">{test.testName}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {/* Left: Pricing & Verification */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400">Your Active Offer</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-800">₹ {finalPrice}</span>
                                {discount > 0 && (
                                    <span className="text-xs font-semibold text-slate-400 line-through">₹ {amount}</span>
                                )}
                            </div>
                            {discount > 0 && (
                                <span className="inline-block text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    {discount}% Discount Applied
                                </span>
                            )}
                            {master?.standardMRP && (
                                <p className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/50">
                                    Platform Standard MRP: ₹ {master.standardMRP}
                                </p>
                            )}
                        </div>

                        {/* Service Mode Card */}
                        <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-2 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> Turnaround</span>
                                <span>{test.reportTime || "24 Hours"}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><Tag size={13} className="text-slate-400" /> Mode</span>
                                <span className="text-[#3d3f96]">{test.testType || "Both"}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-slate-400" /> Status</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] ${test.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                    {test.isActive !== false ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Clinical Attributes */}
                    <div className="md:col-span-2 space-y-4 border-l border-slate-100 pl-0 md:pl-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Classification</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{test.mainCategory || "Pathology"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Specimen / Sample</p>
                                <p className="text-xs font-bold text-rose-600 mt-0.5 flex items-center gap-1">
                                    <TestTube2 size={13} /> {test.sampleType || "Blood"}
                                </p>
                            </div>
                        </div>

                        {/* Precautions */}
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                <ShieldAlert size={12} className="text-[#3d3f96]" /> Patient Instructions
                            </p>
                            <p className="text-xs font-semibold text-slate-600 mt-1 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
                                {test.precaution || "No specific preparation restrictions stated."}
                            </p>
                        </div>

                        {/* Parameters */}
                        {master?.parameters && master.parameters.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                                    Tested Parameters ({master.parameters.length})
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {master.parameters.map((p, idx) => (
                                        <span key={idx} className="text-[11px] font-bold px-2.5 py-1 bg-slate-50 border border-slate-200/60 text-slate-700 rounded-lg">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description Notes */}
                        {test.description && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                    <FileText size={12} className="text-[#3d3f96]" /> Laboratory Notes
                                </p>
                                <p className="text-xs font-medium text-slate-600 mt-1">
                                    {test.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}