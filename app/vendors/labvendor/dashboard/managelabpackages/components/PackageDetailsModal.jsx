"use client";
import React from "react";
import { X, Sparkles, TestTube2, Clock, CheckCircle2, ShieldCheck } from "lucide-react";

export default function PackageDetailsModal({ pkg, onClose }) {
  if (!pkg) return null;

  const tests = Array.isArray(pkg.tests) ? pkg.tests : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white rounded-[2rem] max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                {pkg.isCustom ? "Custom Bundle" : "Admin Master"}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{pkg.mainCategory || "Pathology"}</span>
            </div>
            <h2 className="text-lg font-black text-slate-900">{pkg.packageName}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Offer Price</span>
              <span className="text-sm font-extrabold text-slate-900">₹ {pkg.offerPrice}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Tests</span>
              <span className="text-sm font-extrabold text-[#3d3f96]">{tests.length || pkg.totalTestsIncluded}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Time</span>
              <span className="text-sm font-extrabold text-slate-900">{pkg.reportTime || "12 Hours"}</span>
            </div>
          </div>

          {/* Included Tests List */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Included Diagnostic Tests
            </span>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
              {tests.length > 0 ? (
                tests.map((test, idx) => (
                  <div key={test._id || idx} className="py-2 px-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {typeof test === "object" ? test.testName : `Test ID: ${test}`}
                      </p>
                      {test.sampleType && (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                          <TestTube2 size={10} className="text-rose-500" /> Specimen: {test.sampleType}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Test list not populated.</p>
              )}
            </div>
          </div>

          {/* Clinical Instructions */}
          {pkg.precaution && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-2xl text-xs text-amber-900">
              <strong className="block text-[10px] uppercase font-black text-amber-800 mb-0.5">
                Preparation Instructions:
              </strong>
              {pkg.precaution}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}