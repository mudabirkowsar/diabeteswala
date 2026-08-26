"use client";

import React, { useState, useEffect } from 'react';
import { 
    Truck, 
    MapPin, 
    Layers, 
    Percent, 
    Clock, 
    ShieldCheck, 
    Save, 
    Loader2, 
    Utensils, 
    Pill, 
    Activity, 
    AlertCircle 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import Admin API service functions
import AdminAPI from '../../../../services/AdminAPI'; // Adjust relative path based on folder depth

export default function DeliveryChargesConfigPage() {
    // --- Active Module Switching States ---
    const [vendorType, setVendorType] = useState('Food'); // Default is 'Food', supports 'Pharmacy' | 'Lab'
    
    // --- Data & Loading States ---
    const [activeConfig, setActiveConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- Form States ---
    const [formFixedPrice, setFormFixedPrice] = useState('');
    const [formFixedDistance, setFormFixedDistance] = useState('');
    const [formPricePerKM, setFormPricePerKM] = useState('');
    const [formRapidCharge, setFormRapidCharge] = useState('');
    const [formIsRapidAvailable, setFormIsRapidAvailable] = useState(true);
    const [formPackagingCharge, setFormPackagingCharge] = useState('');
    const [formFreeDeliveryThreshold, setFormFreeDeliveryThreshold] = useState('');
    const [formTaxPercentage, setFormTaxPercentage] = useState('');

    // --- Fetch Active Delivery Configuration Rules ---
    const loadActiveConfig = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getActiveDeliveryConfig({ vendorType });
            if (response && response.success) {
                const data = response.data || null;
                setActiveConfig(data);
                
                // Pre-populate input states if rules are present
                if (data) {
                    setFormFixedPrice(data.fixedPrice?.toString() || '');
                    setFormFixedDistance(data.fixedDistance?.toString() || '');
                    setFormPricePerKM(data.pricePerKM?.toString() || '');
                    setFormRapidCharge(data.rapidCharge?.toString() || '');
                    setFormIsRapidAvailable(data.isRapidAvailable ?? true);
                    setFormPackagingCharge(data.packagingCharge?.toString() || '');
                    setFormFreeDeliveryThreshold(data.freeDeliveryThreshold?.toString() || '');
                    setFormTaxPercentage(data.taxPercentage?.toString() || '');
                } else {
                    // Reset fields for fresh creation
                    setFormFixedPrice('');
                    setFormFixedDistance('');
                    setFormPricePerKM('');
                    setFormRapidCharge('');
                    setFormIsRapidAvailable(true);
                    setFormPackagingCharge('');
                    setFormFreeDeliveryThreshold('');
                    setFormTaxPercentage('');
                }
            }
        } catch (err) {
            console.error("Error retrieving logistics config:", err);
            toast.error("Failed to load active logistics pricing rules.");
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when switching active modules
    useEffect(() => {
        loadActiveConfig();
    }, [vendorType]);

    // --- Unified Save / Update Handler ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            fixedPrice: Number(formFixedPrice) || 0,
            fixedDistance: Number(formFixedDistance) || 0,
            pricePerKM: Number(formPricePerKM) || 0,
            rapidCharge: Number(formRapidCharge) || 0,
            isRapidAvailable: formIsRapidAvailable,
            packagingCharge: Number(formPackagingCharge) || 0,
            freeDeliveryThreshold: Number(formFreeDeliveryThreshold) || 0,
            taxPercentage: Number(formTaxPercentage) || 0,
            vendorType: vendorType
        };

        try {
            let response;
            // If config document already exists in DB, run PUT update, otherwise POST save [cite: custom_context]
            if (activeConfig && activeConfig._id) {
                response = await AdminAPI.updateAdminDeliveryCharges(payload);
            } else {
                response = await AdminAPI.saveAdminDeliveryCharges(payload);
            }

            if (response && response.success) {
                toast.success(response.message || "Logistics pricing policy saved successfully!");
                await loadActiveConfig(); // Re-sync local state
            }
        } catch (err) {
            console.error("Error saving logistics configurations:", err);
            toast.error(err.response?.data?.message || "Failed to finalize pricing modifications.");
        } finally {
            setSaving(false);
        }
    };

    const modules = [
        { id: 'Food', name: 'Food Platform', icon: <Utensils size={15} /> },
        { id: 'Pharmacy', name: 'Pharmacy OTC', icon: <Pill size={15} /> },
        { id: 'Lab', name: 'Lab Diagnostics', icon: <Activity size={15} /> }
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 py-4 pb-12 antialiased select-none text-left">
            <Toaster position="top-right" />
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 flex-shrink-0 shadow-sm">
                        <Truck className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Logistics Pricing Configurations</h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">Manage global payment thresholds, tax rates, express dispatch surcharges, and distance-based fees.</p>
                    </div>
                </div>
            </div>

            {/* --- MODULE SWITCHER NAVTABS --- */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 border-b border-slate-100 [&::-webkit-scrollbar]:hidden">
                {modules.map((mod) => {
                    const isSelected = vendorType === mod.id;
                    return (
                        <button
                            key={mod.id}
                            onClick={() => setVendorType(mod.id)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-2 ${
                                isSelected
                                    ? 'bg-red-50/60 text-red-600 border-red-200/60 font-black shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                            }`}
                        >
                            {mod.icon}
                            <span>{mod.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Split Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retrieving module specifications...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* COLUMN A: CURRENT ACTIVE OVERVIEW CARDS (5/12) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-50 pb-2">
                                Active Policy Monograph ({vendorType})
                            </span>

                            {activeConfig ? (
                                <div className="space-y-4 text-xs font-bold text-slate-600">
                                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] text-slate-400 block uppercase">Base Delivery Fee</span>
                                            <strong className="text-slate-800 text-sm font-mono">₹{activeConfig.fixedPrice}</strong>
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">
                                            Within {activeConfig.fixedDistance} KM
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                                            <span className="text-[9px] text-slate-400 block uppercase mb-1">Additional Rate / KM</span>
                                            <strong className="text-slate-800 text-sm font-mono">₹{activeConfig.pricePerKM}</strong>
                                        </div>
                                        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                                            <span className="text-[9px] text-slate-400 block uppercase mb-1">Flat Packaging Surcharge</span>
                                            <strong className="text-slate-800 text-sm font-mono">₹{activeConfig.packagingCharge}</strong>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                                            <span className="text-[9px] text-slate-400 block uppercase mb-1">Free Delivery Threshold</span>
                                            <strong className="text-slate-800 text-sm font-mono">₹{activeConfig.freeDeliveryThreshold}</strong>
                                        </div>
                                        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                                            <span className="text-[9px] text-slate-400 block uppercase mb-1">GST Tax applied</span>
                                            <strong className="text-slate-800 text-sm font-mono">{activeConfig.taxPercentage}%</strong>
                                        </div>
                                    </div>

                                    {activeConfig.isRapidAvailable && (
                                        <div className="flex items-center justify-between p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl">
                                            <span className="text-[10px] text-amber-800 uppercase flex items-center gap-1.5 leading-none">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                                Express Delivery Active
                                            </span>
                                            <strong className="text-amber-800 text-sm font-mono">+ ₹{activeConfig.rapidCharge}</strong>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center border border-slate-100 rounded-2xl bg-slate-50 space-y-1.5">
                                    <AlertCircle className="mx-auto text-slate-300" size={32} />
                                    <h4 className="text-xs font-black text-slate-700">No Custom Rules Saved</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">Use the configuration form beside to set global rates.</p>
                                </div>
                            )}
                        </div>

                        {/* Certified Banner */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                            <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                            <div className="space-y-0.5">
                                <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">FSSAI Certified Preparation</span>
                                <span className="text-xs text-emerald-700/90 font-medium leading-relaxed block">
                                    All dynamic calculation parameters are compiled securely into patient invoicing systems in real time during client checkouts.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN B: INTERACTIVE OVERRIDE CONFIGURATION FORM (7/12) */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-50 pb-2 mb-5">
                                Configure logistics rates ({vendorType})
                            </span>

                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Delivery Fee (₹) *</label>
                                        <input 
                                            type="number"
                                            required
                                            value={formFixedPrice}
                                            onChange={(e) => setFormFixedPrice(e.target.value)}
                                            placeholder="e.g. 40"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Cover Radius (KM) *</label>
                                        <input 
                                            type="number"
                                            required
                                            value={formFixedDistance}
                                            onChange={(e) => setFormFixedDistance(e.target.value)}
                                            placeholder="e.g. 5"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Additional Rate / KM (₹) *</label>
                                        <input 
                                            type="number"
                                            required
                                            value={formPricePerKM}
                                            onChange={(e) => setFormPricePerKM(e.target.value)}
                                            placeholder="e.g. 10"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Flat Packaging Charge (₹) *</label>
                                        <input 
                                            type="number"
                                            required
                                            value={formPackagingCharge}
                                            onChange={(e) => setFormPackagingCharge(e.target.value)}
                                            placeholder="e.g. 15"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Free Delivery Limit (₹) *</label>
                                        <input 
                                            type="number"
                                            required
                                            value={formFreeDeliveryThreshold}
                                            onChange={(e) => setFormFreeDeliveryThreshold(e.target.value)}
                                            placeholder="e.g. 500"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logistics Tax Percentage (%) *</label>
                                        <input 
                                            type="number"
                                            required
                                            value={formTaxPercentage}
                                            onChange={(e) => setFormTaxPercentage(e.target.value)}
                                            placeholder="e.g. 5"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                {/* Express Delivery details */}
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="space-y-1 max-w-[280px]">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Express Delivery</span>
                                        <span className="text-[11px] font-bold text-slate-400 block leading-tight">Enable priority express dispatch surcharges for rapid orders.</span>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        {formIsRapidAvailable && (
                                            <input 
                                                type="number"
                                                required={formIsRapidAvailable}
                                                value={formRapidCharge}
                                                onChange={(e) => setFormRapidCharge(e.target.value)}
                                                placeholder="Fee e.g. 25"
                                                className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                                            />
                                        )}

                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formIsRapidAvailable}
                                                onChange={() => setFormIsRapidAvailable(!formIsRapidAvailable)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3d3f96]" />
                                        </label>
                                    </div>
                                </div>

                                {/* Form Submit Actions */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-7 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
                                    >
                                        {saving ? (
                                            <Loader2 size={13} className="animate-spin text-white" />
                                        ) : (
                                            <Save size={13} />
                                        )}
                                        <span>{activeConfig && activeConfig._id ? 'Update Configuration' : 'Save Configuration'}</span>
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
}