import React from 'react';
import { Activity, Droplets, Brain, HeartPulse, Zap, Info } from 'lucide-react';

function DescriptionDiabetes() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-[#3d3f96] px-4 py-1.5 rounded-full mb-4">
            <Info size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Health Education</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
            Understanding <span className="text-[#3d3f96]">Diabetes</span> & Your Body
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Diabetes is more than just "high sugar." It is a complex hormonal condition that affects how your body turns food into energy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* --- LEFT SIDE: THE HORMONAL CONNECTION --- */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">The Role of Hormones</h3>
            </div>

            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p className="font-medium">
                The primary hormone involved in diabetes is <span className="text-[#3d3f96] font-bold">Insulin</span>, produced by your pancreas. Think of insulin as a "key" that unlocks your cells to let glucose (sugar) in for energy.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2">
                    <Droplets size={18} className="text-blue-500" /> Insulin
                  </h4>
                  <p className="text-xs font-medium">Helps lower blood sugar by moving glucose into cells for fuel.</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2">
                    <Activity size={18} className="text-red-500" /> Glucagon
                  </h4>
                  <p className="text-xs font-medium">Signals the liver to release stored sugar when levels are too low.</p>
                </div>
              </div>

              <p className="text-sm italic pt-4 border-t border-slate-100">
                In diabetes, your body either doesn't make enough insulin or can't use it effectively, causing sugar to build up in your bloodstream.
              </p>
            </div>
          </div>

          {/* --- RIGHT SIDE: IMPACT ON HEALTH --- */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-800 px-2">How Diabetes Affects You</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Feature 1 */}
              <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-lg transition-all group">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-[#3d3f96] group-hover:text-white transition-colors">
                  <HeartPulse size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800">Cardiovascular Health</h4>
                  <p className="text-sm text-slate-500 font-medium">High sugar levels can damage blood vessels and the nerves that control your heart.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-lg transition-all group">
                <div className="bg-purple-50 p-4 rounded-2xl text-purple-600 group-hover:bg-[#3d3f96] group-hover:text-white transition-colors">
                  <Brain size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800">Neurological Impact</h4>
                  <p className="text-sm text-slate-500 font-medium">Over time, diabetes can cause nerve damage (neuropathy), leading to numbness or pain.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-lg transition-all group">
                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:bg-[#3d3f96] group-hover:text-white transition-colors">
                  <Activity size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800">Metabolic Balance</h4>
                  <p className="text-sm text-slate-500 font-medium">Proper management helps maintain energy levels and prevents long-term complications.</p>
                </div>
              </div>
            </div>

            {/* CTA Link */}
            <div className="pt-4 px-2">
                <button className="text-[#3d3f96] font-black text-sm flex items-center gap-2 hover:underline">
                    Learn more about Diabetes Reversal <Zap size={16} className="fill-[#3d3f96]" />
                </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default DescriptionDiabetes;