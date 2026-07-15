import React from 'react';
import { Beaker, Home, Clock, ShieldCheck, ChevronRight, Plus, Star } from 'lucide-react';

function LabTestShowcase() {
  // Sample data for 6 lab packages
  const labTests = [
    { 
      id: 1, 
      name: "Diabetes Care Basic", 
      parameters: "25 Parameters", 
      price: "₹499", 
      oldPrice: "₹999", 
      tag: "Best Seller",
      tests: ["HbA1c", "Fasting Sugar", "Urine Routine"]
    },
    { 
      id: 2, 
      name: "HbA1c (Glycated Hemoglobin)", 
      parameters: "Single Test", 
      price: "₹299", 
      oldPrice: "₹500", 
      tag: "Essential",
      tests: ["3 Months Average Sugar"]
    },
    { 
      id: 3, 
      name: "Full Body Checkup", 
      parameters: "80 Parameters", 
      price: "₹1,499", 
      oldPrice: "₹2,999", 
      tag: "Recommended",
      tests: ["Liver Profile", "Kidney Profile", "Lipid Profile"]
    },
    { 
      id: 4, 
      name: "Lipid Profile", 
      parameters: "8 Parameters", 
      price: "₹350", 
      oldPrice: "₹700", 
      tag: "Heart Health",
      tests: ["Cholesterol", "Triglycerides", "HDL/LDL"]
    },
    { 
      id: 5, 
      name: "Kidney Function Test", 
      parameters: "11 Parameters", 
      price: "₹550", 
      oldPrice: "₹900", 
      tag: "Vital Care",
      tests: ["Creatinine", "Uric Acid", "BUN"]
    },
    { 
      id: 6, 
      name: "Advanced Diabetes Reversal", 
      parameters: "45 Parameters", 
      price: "₹2,499", 
      oldPrice: "₹4,500", 
      tag: "Premium",
      tests: ["Insulin Fasting", "C-Peptide", "Vitamin D"]
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Popular <span className="text-[#3d3f96]">Lab Packages</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">NABL Accredited labs with home sample collection</p>
          </div>
          <button className="text-[#3d3f96] font-bold text-xs flex items-center gap-1 hover:underline uppercase tracking-wider">
            View All Tests <ChevronRight size={14} />
          </button>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex overflow-x-auto gap-6 pb-8 
          [&::-webkit-scrollbar]:hidden 
          [-ms-overflow-style:none] 
          [scrollbar-width:none]"
        >
          {labTests.map((test) => (
            <div 
              key={test.id} 
              className="flex-shrink-0 w-72 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group p-6 flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-blue-50 p-3 rounded-2xl text-[#3d3f96]">
                    <Beaker size={24} />
                  </div>
                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest">
                    {test.tag}
                  </span>
                </div>

                {/* Test Info */}
                <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 group-hover:text-[#3d3f96] transition-colors">
                  {test.name}
                </h3>
                <p className="text-xs font-bold text-slate-400 mb-4">{test.parameters}</p>

                {/* Included Tests List */}
                <div className="space-y-2 mb-6">
                  {test.tests.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      {item}
                    </div>
                  ))}
                </div>

                {/* Features Row */}
                <div className="flex items-center gap-4 mb-6 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Home size={14} />
                    <span className="text-[9px] font-bold uppercase">Home</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[9px] font-bold uppercase">24h Report</span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-xl font-black text-slate-900">{test.price}</p>
                  <p className="text-xs text-slate-400 line-through font-bold">{test.oldPrice}</p>
                </div>
                <button className="bg-[#3d3f96] text-white p-3 rounded-xl hover:bg-[#2d2f75] transition-all shadow-lg shadow-indigo-100 active:scale-95">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Footer */}
        <div className="mt-4 flex flex-wrap items-center gap-8 justify-center lg:justify-start opacity-60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <ShieldCheck size={16} /> NABL Accredited
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Star size={16} fill="currentColor" className="text-yellow-500" /> 4.8/5 Lab Rating
            </div>
        </div>
      </div>
    </section>
  );
}

export default LabTestShowcase;