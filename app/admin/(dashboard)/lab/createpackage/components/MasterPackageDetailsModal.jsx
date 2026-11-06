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
  Building2,
  TrendingDown
} from 'lucide-react';

export default function MasterPackageDetailsModal({ pkg, onClose }) {
  if (!pkg) return null;

  const tests = Array.isArray(pkg.tests) ? pkg.tests : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white rounded-[2.5rem] max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
            <PackageCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Master Package Specification</span>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{pkg.packageName}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Left Column: Pricing & Adoption Metrics */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Benchmark Standard MRP</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800">₹ {pkg.standardMRP || 0}</span>
              </div>
            </div>

            {/* Vendor Market Metrics */}
            <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-[#3d3f96]">Platform Adoption</span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Building2 size={14} className="text-[#3d3f96]" />
                <span>{pkg.vendorCount !== undefined ? `${pkg.vendorCount} Active Labs Offering` : "0 Labs Offering"}</span>
              </div>
              {pkg.minPrice !== undefined && pkg.minPrice > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <TrendingDown size={14} />
                  <span>Lowest Price: ₹{pkg.minPrice}</span>
                </div>
              )}
            </div>

            {/* Operational Demographics Card */}
            <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-600">
                <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> TAT</span>
                <span>{pkg.reportTime || "24 Hours"}</span>
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
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-slate-400" /> Platform Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${pkg.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {pkg.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Specimen, Fasting & Bundled Tests */}
          <div className="md:col-span-2 space-y-4 border-l border-slate-100 pl-0 md:pl-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Classification</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{pkg.mainCategory || "Pathology"}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{pkg.category || "Full Body"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Specimen Types</p>
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

            {/* Fasting Instructions */}
            {pkg.isFastingRequired && (
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <ShieldAlert size={12} className="text-[#3d3f96]" /> Fasting Protocol
                </p>
                <div className="text-xs font-semibold text-slate-600 mt-1 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
                  <p className="font-bold text-amber-800">
                    Fasting Duration: {pkg.fastingDuration || "10-12 Hours"}
                  </p>
                </div>
              </div>
            )}

            {/* Included Diagnostic Tests */}
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles size={12} className="text-[#3d3f96]" /> Linked Master Tests ({tests.length})
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                {tests.length > 0 ? (
                  tests.map((t, idx) => {
                    const isObj = typeof t === 'object' && t !== null;
                    const testName = isObj ? t.testName : `Test ID: ${t}`;
                    const mrp = isObj ? t.standardMRP : null;

                    return (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">{testName}</span>
                        {mrp !== null && (
                          <span className="text-xs font-black text-slate-600">₹{mrp}</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">No tests currently linked to this package.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}