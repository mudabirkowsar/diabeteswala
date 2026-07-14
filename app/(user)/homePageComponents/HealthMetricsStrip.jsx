import React from 'react';
import { Activity, Droplets, Scale } from 'lucide-react';

const HealthMetricsStrip = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-wrap justify-around gap-6">
        
        <div className="flex items-center gap-3">
          <Droplets className="text-red-500" size={20} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Sugar</p>
            <p className="text-sm font-black text-slate-800">Target: 70-130 mg/dL</p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <Activity className="text-blue-500" size={20} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HbA1c Level</p>
            <p className="text-sm font-black text-slate-800">Target: Below 7%</p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <Scale className="text-emerald-500" size={20} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Body Weight</p>
            <p className="text-sm font-black text-slate-800">BMI: 18.5 - 24.9</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HealthMetricsStrip;