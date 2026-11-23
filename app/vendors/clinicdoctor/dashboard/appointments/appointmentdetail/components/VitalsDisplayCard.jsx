"use client";

import React from 'react';
import { Activity, Heart, Thermometer, Wind, Edit3 } from 'lucide-react';

export default function VitalsDisplayCard({ vitals, onEditVitals, canEdit }) {
  if (!vitals || (!vitals.bp && !vitals.pulse && !vitals.temp && !vitals.spo2)) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div className="flex items-center gap-2 text-rose-600">
          <Activity size={16} />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Recorded Patient Vitals
          </h3>
        </div>
        {canEdit && (
          <button
            onClick={onEditVitals}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl transition cursor-pointer"
          >
            <Edit3 size={12} />
            <span>Update Vitals</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Blood Pressure */}
        <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Activity size={16} />
          </div>
          <div>
            <span className="text-[10px] text-rose-700 uppercase block font-bold">BP (mmHg)</span>
            <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
              {vitals.bp || '—'}
            </strong>
          </div>
        </div>

        {/* Pulse */}
        <div className="bg-red-50/60 p-3 rounded-2xl border border-red-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Heart size={16} />
          </div>
          <div>
            <span className="text-[10px] text-red-700 uppercase block font-bold">Pulse (BPM)</span>
            <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
              {vitals.pulse || '—'}
            </strong>
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Thermometer size={16} />
          </div>
          <div>
            <span className="text-[10px] text-amber-700 uppercase block font-bold">Body Temp</span>
            <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
              {vitals.temp || '—'}
            </strong>
          </div>
        </div>

        {/* SpO2 */}
        <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Wind size={16} />
          </div>
          <div>
            <span className="text-[10px] text-blue-700 uppercase block font-bold">SpO2 (%)</span>
            <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
              {vitals.spo2 || '—'}
            </strong>
          </div>
        </div>
      </div>

      {vitals.notes && (
        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
          <strong className="font-bold text-slate-800">Triage Notes: </strong>
          {vitals.notes}
        </p>
      )}
    </div>
  );
}