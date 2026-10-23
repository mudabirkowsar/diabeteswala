"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Truck,
    Zap,
    Package,
    Percent,
    IndianRupee,
    MapPin,
    RefreshCw,
    Save,
    Info,
    CheckCircle2,
    AlertCircle,
    Calculator,
    ShieldCheck,
    Loader2,
    Sliders
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service (adjust path based on your folder structure)
import PharmacyVendorAPI from '../../../../services/PharmacyVendorAPI';

export default function StoreDeliveryChargesPage() {
    // --- States ---
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDefault, setIsDefault] = useState(false);
    const [hasExistingConfig, setHasExistingConfig] = useState(false);

    // --- Form State ---
    const [formData, setFormData] = useState({
        fixedPrice: 40,
        fixedDistance: 5,
        pricePerKM: 10,
        fastDeliveryExtra: 25,
        isRapidAvailable: true,
        packagingCharge: 15,
        freeDeliveryThreshold: 500,
        taxPercentage: 5,
        city: '',
        state: ''
    });

    // --- Live Calculator Simulation States ---
    const [calcDistance, setCalcDistance] = useState(8); // in KM
    const [calcOrderAmount, setCalcOrderAmount] = useState(350); // in ₹
    const [calcIsExpress, setCalcIsExpress] = useState(false);

    // --- 1. Fetch Current Delivery Settings ---
    const fetchDeliveryCharges = async () => {
        setLoading(true);
        try {
            const res = await PharmacyVendorAPI.getMyStoreDeliveryCharges();
            if (res && res.success) {
                setIsDefault(!!res.isDefault);
                if (res.data) {
                    setHasExistingConfig(!res.isDefault);
                    setFormData({
                        fixedPrice: res.data.fixedPrice ?? 40,
                        fixedDistance: res.data.fixedDistance ?? 5,
                        pricePerKM: res.data.pricePerKM ?? 10,
                        fastDeliveryExtra: res.data.fastDeliveryExtra ?? res.data.rapidCharge ?? 25,
                        isRapidAvailable: res.data.isRapidAvailable ?? true,
                        packagingCharge: res.data.packagingCharge ?? 15,
                        freeDeliveryThreshold: res.data.freeDeliveryThreshold ?? 500,
                        taxPercentage: res.data.taxPercentage ?? 5,
                        city: res.data.city || '',
                        state: res.data.state || ''
                    });
                }
            } else {
                toast.error('Failed to load store delivery policy.');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error retrieving delivery charges.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveryCharges();
    }, []);

    // --- Input Change Handler ---
    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend Validations
        if (Number(formData.fixedPrice) < 0) return toast.error('Base delivery fee cannot be negative.');
        if (Number(formData.fixedDistance) <= 0) return toast.error('Base distance must be greater than 0 KM.');
        if (Number(formData.pricePerKM) < 0) return toast.error('Per KM charge cannot be negative.');

        setSaving(true);
        try {
            const payload = {
                fixedPrice: Number(formData.fixedPrice),
                fixedDistance: Number(formData.fixedDistance),
                pricePerKM: Number(formData.pricePerKM),
                fastDeliveryExtra: Number(formData.fastDeliveryExtra),
                isRapidAvailable: Boolean(formData.isRapidAvailable),
                packagingCharge: Number(formData.packagingCharge),
                freeDeliveryThreshold: Number(formData.freeDeliveryThreshold),
                taxPercentage: Number(formData.taxPercentage),
                city: formData.city.trim(),
                state: formData.state.trim()
            };

            let res;
            // If store already has a configured record, use PUT update; else POST save
            if (hasExistingConfig) {
                res = await PharmacyVendorAPI.updateStoreDeliveryCharges(payload);
            } else {
                res = await PharmacyVendorAPI.saveStoreDeliveryCharges(payload);
            }

            if (res && res.success) {
                toast.success(res.message || 'Delivery configuration saved successfully!');
                setIsDefault(false);
                setHasExistingConfig(true);
                fetchDeliveryCharges();
            } else {
                toast.error(res?.message || 'Failed to save delivery policy.');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error saving delivery configuration.');
        } finally {
            setSaving(false);
        }
    };

    // --- Interactive Live Fee Calculation Logic ---
    const calculationPreview = useMemo(() => {
        const fixedDist = Number(formData.fixedDistance) || 0;
        const fixedP = Number(formData.fixedPrice) || 0;
        const perKM = Number(formData.pricePerKM) || 0;
        const packaging = Number(formData.packagingCharge) || 0;
        const freeThreshold = Number(formData.freeDeliveryThreshold) || 0;
        const taxRate = Number(formData.taxPercentage) || 0;
        const rapidCharge = formData.isRapidAvailable && calcIsExpress ? Number(formData.fastDeliveryExtra) || 0 : 0;

        const isFree = freeThreshold > 0 && calcOrderAmount >= freeThreshold;

        let baseDelivery = 0;
        let extraKmCharge = 0;

        if (!isFree) {
            baseDelivery = fixedP;
            if (calcDistance > fixedDist) {
                extraKmCharge = (calcDistance - fixedDist) * perKM;
            }
        }

        const subtotal = (isFree ? 0 : baseDelivery + extraKmCharge) + rapidCharge + packaging;
        const tax = (subtotal * taxRate) / 100;
        const totalDeliveryFee = Math.round((subtotal + tax) * 100) / 100;

        return {
            isFree,
            baseDelivery,
            extraKmCharge,
            extraKMs: Math.max(0, calcDistance - fixedDist),
            rapidCharge,
            packaging,
            tax,
            totalDeliveryFee
        };
    }, [formData, calcDistance, calcOrderAmount, calcIsExpress]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 antialiased text-left">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Loading Delivery Fee Slabs...
                </p>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased text-left select-none">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- HEADER SECTION --- */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#3d3f96] text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
                            <Truck size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Store Delivery Charges &amp; Logistics
                                </h1>
                                {isDefault ? (
                                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                        System Default
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle2 size={11} /> Custom Policy Active
                                    </span>
                                )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                                Configure distance-based delivery slabs, 60-minute express surcharges, and free delivery cart thresholds.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={fetchDeliveryCharges}
                            title="Refresh Settings"
                            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-200 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                        >
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            <span>{saving ? 'Saving Policy...' : 'Save Configuration'}</span>
                        </button>
                    </div>
                </div>

                {/* System Default Alert Banner */}
                {isDefault && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
                        <Info size={18} className="shrink-0 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-bold">You are currently using Platform Standard Delivery Rates</p>
                            <p className="text-[11px] text-amber-700 mt-0.5 font-medium leading-relaxed">
                                Your store currently applies the central system fallback delivery slab. Adjust the pricing below and click &quot;Save Configuration&quot; to activate your store-specific customized fees.
                            </p>
                        </div>
                    </div>
                )}

                {/* --- MAIN GRID: SETTINGS FORM & LIVE CALCULATOR --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT 8 COLS: CONFIGURATION CARDS */}
                    <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-5">

                        {/* Card 1: Distance-Based Base Slabs */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#3d3f96] flex items-center justify-center font-black">
                                        <Truck size={17} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                                            1. Standard Distance Slab
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Base fixed charge and per-kilometer increment beyond base radius
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                {/* Fixed Base Price */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                                        Base Delivery Fee (₹) *
                                    </label>
                                    <div className="relative">
                                        <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            min={0}
                                            step="1"
                                            value={formData.fixedPrice}
                                            onChange={(e) => handleChange('fixedPrice', e.target.value)}
                                            placeholder="40"
                                            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium ml-1">Standard initial charge</span>
                                </div>

                                {/* Fixed Distance Coverage */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                                        Base Distance Radius (KM) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            step="0.5"
                                            value={formData.fixedDistance}
                                            onChange={(e) => handleChange('fixedDistance', e.target.value)}
                                            placeholder="5"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                                            KM
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium ml-1">Covered under base fee</span>
                                </div>

                                {/* Price Per Extra KM */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                                        Per Extra KM Fee (₹) *
                                    </label>
                                    <div className="relative">
                                        <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            min={0}
                                            step="0.5"
                                            value={formData.pricePerKM}
                                            onChange={(e) => handleChange('pricePerKM', e.target.value)}
                                            placeholder="10"
                                            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium ml-1">Each extra KM beyond base</span>
                                </div>

                            </div>
                        </div>

                        {/* Card 2: Express Delivery & Packaging Fees */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                                        <Zap size={17} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                                            2. Express Service &amp; Safe Packaging
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Manage 60-minute priority dispatch and medical tamper-evident packaging fees
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">

                                {/* 1-Hour Rapid Delivery Toggle */}
                                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800">1-Hour Express</span>
                                        <input
                                            type="checkbox"
                                            id="rapidToggle"
                                            checked={formData.isRapidAvailable}
                                            onChange={(e) => handleChange('isRapidAvailable', e.target.checked)}
                                            className="w-4 h-4 accent-[#3d3f96] rounded cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                        Allow urgent 60-min delivery option for priority medicines &amp; samples
                                    </p>
                                </div>

                                {/* Express Surcharge */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                                        Express Surcharge (₹)
                                    </label>
                                    <div className="relative">
                                        <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            disabled={!formData.isRapidAvailable}
                                            min={0}
                                            step="1"
                                            value={formData.fastDeliveryExtra}
                                            onChange={(e) => handleChange('fastDeliveryExtra', e.target.value)}
                                            placeholder="25"
                                            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all disabled:opacity-50"
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium ml-1">Added to standard delivery</span>
                                </div>

                                {/* Packaging Fee */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                                        Safe Packaging Fee (₹)
                                    </label>
                                    <div className="relative">
                                        <Package size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min={0}
                                            step="1"
                                            value={formData.packagingCharge}
                                            onChange={(e) => handleChange('packagingCharge', e.target.value)}
                                            placeholder="15"
                                            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium ml-1">Tamper-proof bags / cooling kits</span>
                                </div>

                            </div>
                        </div>

                        {/* Card 3: Free Delivery Threshold & Tax */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                                        <Percent size={17} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                                            3. Free Shipping Threshold &amp; GST Tax
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Reward higher cart values with zero delivery fees and set tax rates
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Free Delivery Order Value Threshold */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                                        Free Delivery Min Cart Value (₹)
                                    </label>
                                    <div className="relative">
                                        <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min={0}
                                            step="10"
                                            value={formData.freeDeliveryThreshold}
                                            onChange={(e) => handleChange('freeDeliveryThreshold', e.target.value)}
                                            placeholder="500"
                                            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium ml-1">
                                        Carts equal or above this get free base delivery (0 = disabled)
                                    </span>
                                </div>

                                {/* Tax on Delivery */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                                        Logistics Tax / GST (%)
                                    </label>
                                    <div className="relative">
                                        <Percent size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min={0}
                                            max={28}
                                            step="0.5"
                                            value={formData.taxPercentage}
                                            onChange={(e) => handleChange('taxPercentage', e.target.value)}
                                            placeholder="5"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium ml-1">
                                        Applicable GST on delivery handling
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* Card 4: Operating Territory */}
                        {/* <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black">
                    <MapPin size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      4. Store Territory &amp; Region
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Operational hub jurisdiction (Optional metadata)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                    City Hub
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g. Noida / Mohali"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="e.g. Uttar Pradesh / Punjab"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div> */}

                    </form>

                    {/* RIGHT 4 COLS: INTERACTIVE LIVE CALCULATOR PREVIEW */}
                    <div className="lg:col-span-4 space-y-5 sticky top-6">

                        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-5">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#3d3f96] flex items-center justify-center font-black">
                                    <Calculator size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                        Live Fee Simulation
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-bold">
                                        Test what your customers will pay at checkout
                                    </p>
                                </div>
                            </div>

                            {/* Simulation Controls */}
                            <div className="space-y-3.5 text-xs">

                                {/* Distance Slider */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-600">
                                        <span>Delivery Distance:</span>
                                        <span className="font-mono text-[#3d3f96] bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                            {calcDistance} KM
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="25"
                                        step="0.5"
                                        value={calcDistance}
                                        onChange={(e) => setCalcDistance(Number(e.target.value))}
                                        className="w-full accent-[#3d3f96] cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                                        <span>1 KM</span>
                                        <span>12 KM</span>
                                        <span>25 KM</span>
                                    </div>
                                </div>

                                {/* Cart Subtotal Input */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black uppercase text-slate-600">
                                        Patient Order Value (₹):
                                    </label>
                                    <div className="relative">
                                        <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min={0}
                                            step={50}
                                            value={calcOrderAmount}
                                            onChange={(e) => setCalcOrderAmount(Number(e.target.value))}
                                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>
                                </div>

                                {/* Express Checkbox (Simulation) */}
                                {formData.isRapidAvailable && (
                                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={calcIsExpress}
                                            onChange={(e) => setCalcIsExpress(e.target.checked)}
                                            className="w-4 h-4 accent-[#3d3f96] rounded"
                                        />
                                        <span className="text-[11px] font-bold text-slate-700">
                                            Customer picks 1-Hour Express (+₹{formData.fastDeliveryExtra})
                                        </span>
                                    </label>
                                )}

                            </div>

                            {/* Calculation Breakdown Receipt */}
                            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">

                                {calculationPreview.isFree ? (
                                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center gap-2 font-bold text-[11px]">
                                        <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                                        <span>Free Shipping Applied (Cart &gt;= ₹{formData.freeDeliveryThreshold})</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between text-slate-500">
                                            <span>Base Delivery (first {formData.fixedDistance} KM):</span>
                                            <span className="font-mono font-bold text-slate-700">₹{calculationPreview.baseDelivery}</span>
                                        </div>

                                        {calculationPreview.extraKMs > 0 && (
                                            <div className="flex items-center justify-between text-slate-500">
                                                <span>Extra Distance ({calculationPreview.extraKMs} KM × ₹{formData.pricePerKM}):</span>
                                                <span className="font-mono font-bold text-slate-700">₹{calculationPreview.extraKmCharge}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {calculationPreview.rapidCharge > 0 && (
                                    <div className="flex items-center justify-between text-amber-600 font-medium">
                                        <span>1-Hour Express Surcharge:</span>
                                        <span className="font-mono font-bold">₹{calculationPreview.rapidCharge}</span>
                                    </div>
                                )}

                                {calculationPreview.packaging > 0 && (
                                    <div className="flex items-center justify-between text-slate-500">
                                        <span>Tamper-Safe Packaging:</span>
                                        <span className="font-mono font-bold text-slate-700">₹{calculationPreview.packaging}</span>
                                    </div>
                                )}

                                {calculationPreview.tax > 0 && (
                                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                        <span>Logistics GST ({formData.taxPercentage}%):</span>
                                        <span className="font-mono">₹{calculationPreview.tax.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Final Estimated Delivery Total */}
                                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                                    <span className="font-black text-slate-900">Total Delivery Fee:</span>
                                    <span className="font-black font-mono text-base text-[#3d3f96]">
                                        ₹{calculationPreview.totalDeliveryFee}
                                    </span>
                                </div>

                            </div>

                            {/* Bottom Quick Save Trigger */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving}
                                className="w-full py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                <span>{saving ? 'Updating...' : 'Publish Delivery Policy'}</span>
                            </button>

                        </div>

                        {/* Platform Policy Notice Card */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-slate-500 text-[11px] space-y-1.5 leading-relaxed">
                            <span className="font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                                <ShieldCheck size={14} className="text-[#3d3f96]" /> Direct Checkout Application
                            </span>
                            <p>
                                Saved rates directly reflect on consumer cart totals when selecting this pharmacy or diagnostic laboratory during checkout.
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}