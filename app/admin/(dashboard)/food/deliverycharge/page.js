"use client";

import React, { useState, useEffect } from 'react';

const INITIAL_CHARGE_DATA = {
  fixedPrice: "40",
  fixedDistance: "5",
  pricePerKM: "10",
  fastDeliveryExtra: "25",
  packagingCharge: "15", // Added packaging container charge default
  freeDeliveryThreshold: "500",
  taxPercentage: "5",
  status: "Active"
};

export default function ManageDeliveryCharges() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chargeData, setChargeData] = useState(INITIAL_CHARGE_DATA);

  // Form states populated by default data
  const [formData, setFormData] = useState({
    fixedPrice: INITIAL_CHARGE_DATA.fixedPrice,
    fixedDistance: INITIAL_CHARGE_DATA.fixedDistance,
    pricePerKM: INITIAL_CHARGE_DATA.pricePerKM,
    fastDeliveryExtra: INITIAL_CHARGE_DATA.fastDeliveryExtra,
    packagingCharge: INITIAL_CHARGE_DATA.packagingCharge, // Bounded to form
    freeDeliveryThreshold: INITIAL_CHARGE_DATA.freeDeliveryThreshold,
    taxPercentage: INITIAL_CHARGE_DATA.taxPercentage,
    status: 'Active'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API save delay
    setTimeout(() => {
      setChargeData(formData);
      setLoading(false);
      setIsModalOpen(false);
    }, 1000);
  };

  return (
    <div className="w-full bg-[#fcfdfe] min-h-screen pb-20 font-sans animate-fade-in">
      
      {/* 1. TOP NAVIGATION / HEADER */}
      <div className="bg-white border-b border-slate-100 top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              <span className="hover:text-[#3D3F96] cursor-pointer transition-colors">Dashboard</span>
              <ChevronRightIcon className="w-2.5 h-2.5" />
              <span className="text-slate-800">Delivery Management</span>
            </nav>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Logistics Configuration
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-[12px] font-medium text-slate-600 mr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Live
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 px-6 py-3 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white text-sm font-bold rounded-xl shadow-lg shadow-[#3D3F96]/15 transition-all active:scale-95 focus:outline-none"
            >
              <EditIcon className="w-4 h-4 stroke-[2.5]" /> 
              {chargeData ? 'Update Rates' : 'Initialize Config'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {loading && !chargeData ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-32 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#3D3F96] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-slate-500 font-bold tracking-tight">Syncing Logistics Data...</p>
          </div>
        ) : chargeData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: MAIN CONTENT */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* STATUS OVERVIEW CARDS (4 Columns Grid Layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-9 h-9 bg-indigo-50/50 text-[#3D3F96] rounded-xl flex items-center justify-center mb-3.5"><RupeeIcon className="w-4 h-4 stroke-[2]" /></div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Base Delivery Fee</p>
                    <h3 className="text-xl font-black text-slate-900">₹{chargeData.fixedPrice}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3.5"><RouteIcon className="w-4 h-4 stroke-[2]" /></div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Base Distance</p>
                    <h3 className="text-xl font-black text-slate-900">{chargeData.fixedDistance} <span className="text-xs font-medium">KM</span></h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-9 h-9 bg-[#3D3F96]/10 text-[#3D3F96] rounded-xl flex items-center justify-center mb-3.5"><PackageIcon className="w-4 h-4 stroke-[2]" /></div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Packaging Charge</p>
                    <h3 className="text-xl font-black text-slate-900">₹{chargeData.packagingCharge}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow border-b-4 border-b-[#3D3F96]">
                    <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3.5"><CheckCircleIcon className="w-4 h-4 stroke-[2]" /></div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">System State</p>
                    <h3 className="text-xl font-black text-[#3D3F96] tracking-tight uppercase">{chargeData.status}</h3>
                </div>
              </div>

              {/* DETAILED BREAKDOWN */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400"><LayerGroupIcon className="w-4.5 h-4.5 stroke-[2]" /></div>
                    <h2 className="font-black text-slate-800 tracking-tight uppercase text-sm">Policy Details</h2>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Additional Rate (per km)</span>
                            <span className="text-lg font-bold text-slate-900">₹{chargeData.pricePerKM}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Fast Delivery Extra Charge</span>
                            <span className="text-lg font-bold text-slate-900">₹{chargeData.fastDeliveryExtra || '0'}</span>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Applied Tax Percentage</span>
                            <span className="text-lg font-bold text-slate-900">{chargeData.taxPercentage}%</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                            <span className="text-[#3D3F96] font-bold text-xs uppercase tracking-wider">Free Threshold</span>
                            <span className="text-lg font-bold text-[#3D3F96]">₹{chargeData.freeDeliveryThreshold}</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LOGIC EXPLAINER WITH WHITE TEXT SETTINGS */}
              <div className="bg-[#1e293b] rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-[#3D3F96]/10 rounded-full blur-3xl group-hover:bg-[#3D3F96]/20 transition-all duration-700"></div>
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 text-white">
                        <InfoIcon className="w-5 h-5 stroke-[2]" />
                        <span className="text-xs font-black uppercase tracking-widest">Calculation Engine</span>
                    </div>
                    {/* Changed text-slate-400 to text-white */}
                    <p className="text-white text-sm leading-relaxed max-w-2xl font-medium">
                        Fees are dynamically calculated during checkout based on the vendor warehouse geolocation. 
                        The base price covers the initial radius, excess distance is billed per kilometer, and packaging fees are appended.
                    </p>
                    {/* Dynamic Formula updated to reflect Packaging Fee */}
                    <div className="bg-black/30 p-4 rounded-xl font-mono text-xs text-indigo-200 inline-block border border-white/5">
                        Total = [Base Delivery] + (Max(0, Distance - {chargeData.fixedDistance}) * {chargeData.pricePerKM}) + {chargeData.packagingCharge} [Packaging]
                    </div>
                </div>
              </div>
            </div>

            {/* RIGHT: SIDEBAR SUMMARY */}
            <div className="lg:col-span-4">
               <div className="bg-white rounded-3xl border border-slate-200/60 p-8 sticky top-28 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <TruckIcon className="text-slate-300 w-5 h-5 stroke-[2]" /> Quick Preview
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Min. Customer Cost</span>
                        <span className="text-3xl font-black text-slate-900">₹{chargeData.fixedPrice} <span className="text-sm font-normal text-slate-400">/ order</span></span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">Taxation</span>
                            <span className="text-xl font-bold text-slate-800">{chargeData.taxPercentage}%</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">Fast Delivery</span>
                            <span className="text-xl font-bold text-slate-800">₹{chargeData.fastDeliveryExtra}</span>
                        </div>
                    </div>
                    
                    <div className="pt-6">
                        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase">
                            <PercentageIcon className="w-4 h-4 stroke-[2]" /> Discount Rules
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                            Orders exceeding <span className="font-bold text-slate-900">₹{chargeData.freeDeliveryThreshold}</span> will bypass delivery charges entirely.
                        </p>
                    </div>
                  </div>
               </div>
            </div>

          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <TruckIcon className="w-12 h-12 stroke-[2] text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">No Configuration Detected</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium leading-relaxed">Your account doesn't have delivery rates set yet. Automated shipping costs cannot be calculated without this configuration.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-4 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-black rounded-2xl shadow-xl shadow-[#3D3F96]/10 transition-all active:scale-95 flex items-center gap-3 mx-auto"
            >
              <span>+</span> Start Configuration
            </button>
          </div>
        )}
      </div>

      {/* 4. PREMIUM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
            
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-start bg-white">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Global Logistics Rates</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Update the pricing engine variables below.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all focus:outline-none">
                <CloseIcon className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto">
              <form id="addChargeForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-[#3D3F96] transition-colors">Home Delivery Charge (₹)</label>
                    <div className="relative">
                        <RupeeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <input name="fixedPrice" type="number" value={formData.fixedPrice} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 ring-indigo-50/50 transition-all font-bold text-slate-800" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-[#3D3F96] transition-colors">Distance Threshold (KM)</label>
                    <div className="relative">
                        <RouteIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <input name="fixedDistance" type="number" value={formData.fixedDistance} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 ring-indigo-50/50 transition-all font-bold text-slate-800" required />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Extra Rate / KM (₹)</label>
                    <input name="pricePerKM" type="number" value={formData.pricePerKM} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 ring-indigo-50/50 transition-all font-bold text-slate-800" required />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fast Delivery Extra (₹)</label>
                    <div className="relative">
                        <BoltIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <input name="fastDeliveryExtra" type="number" value={formData.fastDeliveryExtra} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 ring-indigo-50/50 transition-all font-bold text-slate-800" />
                    </div>
                  </div>

                  {/* Packaging Charges Field added */}
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Packaging Container Fee (₹)</label>
                    <div className="relative">
                        <PackageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 stroke-[2]" />
                        <input name="packagingCharge" type="number" value={formData.packagingCharge} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 ring-indigo-50/50 transition-all font-bold text-slate-800" required />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Free Delivery Minimum (₹)</label>
                    <input name="freeDeliveryThreshold" type="number" value={formData.freeDeliveryThreshold} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 ring-indigo-50/50 transition-all font-bold text-slate-800" />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Percentage (%)</label>
                    <div className="relative">
                        <PercentageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 stroke-[2]" />
                        <input name="taxPercentage" type="number" value={formData.taxPercentage} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 ring-indigo-50/50 transition-all font-bold text-slate-800" />
                    </div>
                  </div>
              </form>
            </div>

            <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-sm font-black text-slate-500 hover:text-slate-800 transition-colors">
                Dismiss
              </button>
              <button type="submit" form="addChargeForm" disabled={loading} className="px-12 py-4 bg-slate-900 hover:bg-black text-white text-sm font-black rounded-2xl shadow-xl shadow-slate-200 flex items-center gap-3 transition-all active:scale-95">
                {loading ? 'Processing...' : <><SaveIcon className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Inline Vector Icons

function ChevronRightIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function EditIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function RupeeIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RouteIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.61c-.38.19-.622.58-.622 1.006v12.023c0 .837.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function CheckCircleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LayerGroupIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m11.142 0L21.75 12l-4.179-2.25m-11.142 0L12 7.5l4.179 2.25m-11.142 0l4.179 2.25m0 0L12 16.5l4.179-2.25m-4.179 2.25l-4.179-2.25m4.179 2.25V21M12 3v4.5" />
    </svg>
  );
}

function InfoIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

function TruckIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.243l1.105-9.4A1.125 1.125 0 014.473 7.5h11.22c.518 0 .961.35 1.077.854l1.245 5.42a1.125 1.125 0 01.32.73V18h-.375a1.5 1.5 0 01-3 0M15 18.75a1.5 1.5 0 00-3 0m3 0h3.75a1.125 1.125 0 001.12-1.243l-1.104-9.4a1.125 1.125 0 00-1.12-1.007H15V18" />
    </svg>
  );
}

function PercentageIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6h.008v.008H6V6zm12 12h.008v.008H18V18z" />
    </svg>
  );
}

function BoltIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function SaveIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h8l5 5v11a2 2 0 01-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PackageIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}