"use client";

import React, { useState, useEffect } from 'react';
import {
  Truck,
  IndianRupee,
  Milestone,
  Package,
  CheckCircle2,
  Layers,
  Info,
  Percent,
  Zap,
  Edit3,
  Save,
  X,
  ChevronRight,
  RefreshCw,
  Loader2,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

const VENDOR_VERTICALS = [
  { key: 'Food', label: 'Food & Nutrition' },
  { key: 'Pharmacy', label: 'Pharmacy Delivery' },
  { key: 'Lab', label: 'Diagnostic Home Sample' }
];

export default function ManageDeliveryCharges() {
  const [selectedVertical, setSelectedVertical] = useState('Food');
  const [chargeData, setChargeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states populated for modal inputs
  const [formData, setFormData] = useState({
    fixedPrice: '40',
    fixedDistance: '5',
    pricePerKM: '10',
    fastDeliveryExtra: '25',
    packagingCharge: '15',
    freeDeliveryThreshold: '500',
    taxPercentage: '5',
    vendorType: 'Food'
  });

  // --- 1. Fetch Delivery Rates from Backend ---
  const fetchDeliveryRates = async () => {
    setLoading(true);
    try {
      // Fetch charges for the selected vertical
      let response;
      if (AdminAPI.getVendorChargesByAdmin) {
        response = await AdminAPI.getVendorChargesByAdmin({ vendorType: selectedVertical });
      } else if (AdminAPI.getVendorDeliveryCharges) {
        response = await AdminAPI.getVendorDeliveryCharges();
      }

      if (response && response.success && response.data) {
        setChargeData(response.data);
        setFormData({
          fixedPrice: (response.data.fixedPrice ?? 40).toString(),
          fixedDistance: (response.data.fixedDistance ?? 5).toString(),
          pricePerKM: (response.data.pricePerKM ?? 10).toString(),
          fastDeliveryExtra: (response.data.fastDeliveryExtra ?? 25).toString(),
          packagingCharge: (response.data.packagingCharge ?? 15).toString(),
          freeDeliveryThreshold: (response.data.freeDeliveryThreshold ?? 500).toString(),
          taxPercentage: (response.data.taxPercentage ?? 5).toString(),
          vendorType: response.data.vendorType || selectedVertical
        });
      } else {
        setChargeData(null);
      }
    } catch (err) {
      console.error("Error loading delivery rates:", err);
      setChargeData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryRates();
  }, [selectedVertical]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal pre-filled
  const openConfigureModal = () => {
    if (chargeData) {
      setFormData({
        fixedPrice: (chargeData.fixedPrice ?? 40).toString(),
        fixedDistance: (chargeData.fixedDistance ?? 5).toString(),
        pricePerKM: (chargeData.pricePerKM ?? 10).toString(),
        fastDeliveryExtra: (chargeData.fastDeliveryExtra ?? 25).toString(),
        packagingCharge: (chargeData.packagingCharge ?? 15).toString(),
        freeDeliveryThreshold: (chargeData.freeDeliveryThreshold ?? 500).toString(),
        taxPercentage: (chargeData.taxPercentage ?? 5).toString(),
        vendorType: chargeData.vendorType || selectedVertical
      });
    }
    setIsModalOpen(true);
  };

  // --- 2. Save / Update Delivery Charges ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const payload = {
      vendorType: selectedVertical,
      fixedPrice: Number(formData.fixedPrice) || 0,
      fixedDistance: Number(formData.fixedDistance) || 0,
      pricePerKM: Number(formData.pricePerKM) || 0,
      fastDeliveryExtra: Number(formData.fastDeliveryExtra) || 0,
      packagingCharge: Number(formData.packagingCharge) || 0,
      freeDeliveryThreshold: Number(formData.freeDeliveryThreshold) || 0,
      taxPercentage: Number(formData.taxPercentage) || 0
    };

    try {
      let response;
      if (AdminAPI.saveGlobalVendorChargesByAdmin) {
        response = await AdminAPI.saveGlobalVendorChargesByAdmin(payload);
      } else if (AdminAPI.saveVendorDeliveryCharges) {
        response = await AdminAPI.saveVendorDeliveryCharges(payload);
      }

      if (response && response.success) {
        toast.success(response.message || "Delivery charges saved successfully.");
        setIsModalOpen(false);
        fetchDeliveryRates();
      } else {
        toast.error("Failed to update delivery rates.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting delivery parameters.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#fcfdfe] min-h-screen pb-20 antialiased select-none text-slate-800">
      <Toaster position="top-right" />

      {/* --- 1. TOP HEADER & VERTICAL SELECTOR --- */}
      <div className="bg-white border-b border-slate-100 top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              <span>Admin Dashboard</span>
              <ChevronRight size={10} />
              <span className="text-[#3d3f96]">Logistics Configuration</span>
            </nav>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Truck className="text-[#3d3f96]" size={24} /> Delivery & Logistics Pricing Engine
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDeliveryRates}
              disabled={loading}
              className="p-3 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              title="Refresh rates"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>

            <button 
              onClick={openConfigureModal}
              className="flex items-center gap-2 px-6 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/10 transition-all cursor-pointer"
            >
              <Edit3 size={14} /> 
              {chargeData ? 'Update Rates' : 'Initialize Config'}
            </button>
          </div>
        </div>

        {/* Vertical Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 border-t border-slate-50 overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden">
          {VENDOR_VERTICALS.map((vertical) => (
            <button
              key={vertical.key}
              onClick={() => setSelectedVertical(vertical.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedVertical === vertical.key
                  ? 'bg-[#3d3f96] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {vertical.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- 2. MAIN DASHBOARD CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-32 flex flex-col items-center justify-center shadow-sm">
            <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Logistics Rates ({selectedVertical})...</p>
          </div>
        ) : chargeData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            
            {/* LEFT: MAIN CONTENT */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 4-COLUMN METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 bg-indigo-50 text-[#3d3f96] rounded-xl flex items-center justify-center mb-3">
                    <IndianRupee size={16} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Base Delivery Fee</p>
                  <h3 className="text-2xl font-black text-slate-900 font-mono">₹{chargeData.fixedPrice ?? 0}</h3>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                    <Milestone size={16} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Base Radius</p>
                  <h3 className="text-2xl font-black text-slate-900 font-mono">
                    {chargeData.fixedDistance ?? 0} <span className="text-xs font-bold text-slate-400">KM</span>
                  </h3>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                    <Package size={16} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Packaging Fee</p>
                  <h3 className="text-2xl font-black text-slate-900 font-mono">₹{chargeData.packagingCharge ?? 0}</h3>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow border-b-4 border-b-emerald-500">
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Engine State</p>
                  <h3 className="text-xl font-black text-emerald-600 uppercase tracking-tight">Active</h3>
                </div>
              </div>

              {/* DETAILED BREAKDOWN CARD */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400">
                      <Layers size={16} />
                    </div>
                    <h2 className="font-black text-slate-800 tracking-tight uppercase text-xs">
                      {selectedVertical} Pricing Policy Breakdown
                    </h2>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Additional Rate (/ KM)</span>
                        <span className="text-base font-black text-slate-900 font-mono">₹{chargeData.pricePerKM ?? 0}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Fast Dispatch Surcharge</span>
                        <span className="text-base font-black text-slate-900 font-mono">₹{chargeData.fastDeliveryExtra ?? 0}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Applied Logistics GST</span>
                        <span className="text-base font-black text-slate-900 font-mono">{chargeData.taxPercentage ?? 0}%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                        <span className="text-[#3d3f96] font-black text-xs uppercase tracking-wider">Free Delivery Threshold</span>
                        <span className="text-base font-black text-[#3d3f96] font-mono">₹{chargeData.freeDeliveryThreshold ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CALCULATION LOGIC EXPLAINER */}
              <div className="bg-[#1e293b] rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl shadow-slate-900/10">
                <div className="relative z-10 space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <Info size={16} className="text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                      Automated Checkout Engine Formula
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-2xl font-medium">
                    Delivery fees are computed dynamically during checkout based on the user's distance from the dispatch center. The base fee covers the initial threshold radius, incremental distance is billed per kilometer, and flat packaging fees are appended.
                  </p>
                  <div className="bg-black/40 p-3.5 rounded-2xl font-mono text-xs text-indigo-200 inline-block border border-white/10">
                    Total = Base (₹{chargeData.fixedPrice}) + Max(0, Distance - {chargeData.fixedDistance} KM) × ₹{chargeData.pricePerKM}/KM + ₹{chargeData.packagingCharge} [Packaging]
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: SIDEBAR SUMMARY */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-slate-100 p-7 sticky top-28 shadow-sm space-y-6">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-50 pb-4">
                  <Truck className="text-[#3d3f96]" size={18} /> Customer Cart Preview
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1 border border-slate-100/60">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Minimum Delivery Cost</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{chargeData.fixedPrice ?? 0} <span className="text-xs font-bold text-slate-400">/ order</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/60">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Taxation</span>
                      <span className="text-lg font-black text-slate-800 font-mono">{chargeData.taxPercentage ?? 0}%</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/60">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Express Extra</span>
                      <span className="text-lg font-black text-slate-800 font-mono">₹{chargeData.fastDeliveryExtra ?? 0}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                      <Percent size={13} /> Free Shipping Rule
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Cart orders exceeding <span className="font-black text-slate-900 font-mono">₹{chargeData.freeDeliveryThreshold ?? 0}</span> automatically waive standard shipping fees.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Truck size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1.5">No Logistics Rates Detected</h3>
            <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto font-medium leading-relaxed">
              No delivery parameters configured for {selectedVertical}. Automated shipping calculations will remain inactive until initialized.
            </p>
            <button 
              onClick={openConfigureModal}
              className="px-8 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-950/10 transition-all cursor-pointer flex items-center gap-2 mx-auto"
            >
              <span>+</span> Start Configuration
            </button>
          </div>
        )}
      </div>

      {/* --- 3. MODAL DIALOG --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 z-10 text-left">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Configure {selectedVertical} Delivery Rates
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">
                  Update automated logistics variables below.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                disabled={actionLoading}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Inputs Form */}
            <form id="deliveryChargeForm" onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Base Delivery Fee (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      name="fixedPrice" 
                      type="number" 
                      value={formData.fixedPrice} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-[#3d3f96] focus:bg-white text-xs font-bold text-slate-800" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Base Distance Radius (KM) *</label>
                  <div className="relative">
                    <Milestone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      name="fixedDistance" 
                      type="number" 
                      value={formData.fixedDistance} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-[#3d3f96] focus:bg-white text-xs font-bold text-slate-800" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Surcharge Rate / KM (₹) *</label>
                  <input 
                    name="pricePerKM" 
                    type="number" 
                    value={formData.pricePerKM} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-[#3d3f96] focus:bg-white text-xs font-bold text-slate-800" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Express Dispatch Extra (₹)</label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      name="fastDeliveryExtra" 
                      type="number" 
                      value={formData.fastDeliveryExtra} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-[#3d3f96] focus:bg-white text-xs font-bold text-slate-800" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Packaging Container Fee (₹) *</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      name="packagingCharge" 
                      type="number" 
                      value={formData.packagingCharge} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-[#3d3f96] focus:bg-white text-xs font-bold text-slate-800" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Free Delivery Minimum (₹)</label>
                  <input 
                    name="freeDeliveryThreshold" 
                    type="number" 
                    value={formData.freeDeliveryThreshold} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-[#3d3f96] focus:bg-white text-xs font-bold text-slate-800" 
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Tax Percentage (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      name="taxPercentage" 
                      type="number" 
                      value={formData.taxPercentage} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-[#3d3f96] focus:bg-white text-xs font-bold text-slate-800" 
                    />
                  </div>
                </div>
              </div>

            </form>

            {/* Footer Buttons */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                disabled={actionLoading}
                className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Dismiss
              </button>
              <button 
                type="submit" 
                form="deliveryChargeForm" 
                disabled={actionLoading} 
                className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/10 flex items-center gap-2 transition cursor-pointer disabled:opacity-70"
              >
                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={14} />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}