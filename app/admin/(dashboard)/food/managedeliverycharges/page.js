"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    AlertCircle,
    Globe,
    Building2,
    X,
    PlusCircle,
    Pencil
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { Country, State, City } from 'country-state-city';

// Import Admin API service functions
import AdminAPI from '../../../../services/AdminAPI'; // Adjust relative path based on folder depth

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150";

export default function DeliveryChargesConfigPage() {
    const vendorType = 'Food'; // Strictly isolated to the Food platform

    // --- Data & Loading States ---
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- Modal Configuration States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editingId, setEditingId] = useState(null); // Tracks ObjectID of item being edited [cite: custom_context]

    // --- country-state-city States ---
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [selectedCountryCode, setSelectedCountryCode] = useState('IN'); // Default to India (IN)
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedCityName, setSelectedCityName] = useState('');

    // --- Form States ---
    const [formFixedPrice, setFormFixedPrice] = useState('');
    const [formFixedDistance, setFormFixedDistance] = useState('');
    const [formPricePerKM, setFormPricePerKM] = useState('');
    const [formRapidCharge, setFormRapidCharge] = useState('');
    const [formIsRapidAvailable, setFormIsRapidAvailable] = useState(true);
    const [formPackagingCharge, setFormPackagingCharge] = useState('');
    const [formFreeDeliveryThreshold, setFormFreeDeliveryThreshold] = useState('');
    const [formTaxPercentage, setFormTaxPercentage] = useState('');

    // --- Load Locations ---
    useEffect(() => {
        setCountries(Country.getAllCountries());
        setStates(State.getStatesOfCountry('IN')); // Populate Indian states by default
    }, []);

    // --- Dynamic Country Change Tracker ---
    useEffect(() => {
        if (selectedCountryCode) {
            setStates(State.getStatesOfCountry(selectedCountryCode));
            setSelectedStateCode('');
            setCities([]);
            setSelectedCityName('');
        }
    }, [selectedCountryCode]);

    // --- Dynamic State Change Tracker ---
    useEffect(() => {
        if (selectedCountryCode && selectedStateCode) {
            setCities(City.getCitiesOfState(selectedCountryCode, selectedStateCode));
            setSelectedCityName('');
        }
    }, [selectedCountryCode, selectedStateCode]);

    // --- Fetch All Saved Delivery Configurations ---
    const loadAllConfigs = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getAdminDeliveryCharges({ vendorType });
            if (response && response.success) {
                const rawData = response.data;
                const normalized = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
                setConfigs(normalized);
            }
        } catch (err) {
            console.error("Error retrieving configs list:", err);
            toast.error("Failed to load active logistics pricing rules.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllConfigs();
    }, []);

    // --- Open Modal for Creation ---
    const openCreateModal = () => {
        setModalMode('create');
        setEditingId(null);
        setSelectedCountryCode('IN');
        setSelectedStateCode('');
        setSelectedCityName('');
        setFormFixedPrice('');
        setFormFixedDistance('');
        setFormPricePerKM('');
        setFormRapidCharge('');
        setFormIsRapidAvailable(true);
        setFormPackagingCharge('');
        setFormFreeDeliveryThreshold('');
        setFormTaxPercentage('');
        setIsModalOpen(true);
    };

    // --- Open Modal for Editing ---
    const handleEditSelect = (config) => {
        setModalMode('edit');
        setEditingId(config._id);
        
        // Find matching Country Code
        const countryMatch = Country.getAllCountries().find(c => c.name.toLowerCase() === config.country?.toLowerCase());
        const countryCode = countryMatch ? countryMatch.isoCode : 'IN';
        setSelectedCountryCode(countryCode);

        // Find matching State Code
        if (config.state) {
            const stateList = State.getStatesOfCountry(countryCode);
            const stateMatch = stateList.find(s => s.name.toLowerCase() === config.state?.toLowerCase());
            if (stateMatch) {
                setSelectedStateCode(stateMatch.isoCode);
                // Populate Cities dropdown immediately
                setCities(City.getCitiesOfState(countryCode, stateMatch.isoCode));
            }
        }

        setSelectedCityName(config.city || '');

        // Populate Form Fields
        setFormFixedPrice(config.fixedPrice?.toString() || '');
        setFormFixedDistance(config.fixedDistance?.toString() || '');
        setFormPricePerKM(config.pricePerKM?.toString() || '');
        setFormRapidCharge(config.rapidCharge?.toString() || '');
        setFormIsRapidAvailable(config.isRapidAvailable ?? true);
        setFormPackagingCharge(config.packagingCharge?.toString() || '');
        setFormFreeDeliveryThreshold(config.freeDeliveryThreshold?.toString() || '');
        setFormTaxPercentage(config.taxPercentage?.toString() || '');
        
        setIsModalOpen(true);
    };

    // --- Unified Save / Update Action ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const countryObj = Country.getCountryByCode(selectedCountryCode);
        const stateObj = State.getStateByCodeAndCountry(selectedStateCode, selectedCountryCode);

        const payload = {
            country: countryObj ? countryObj.name : "India",
            state: stateObj ? stateObj.name : "",
            city: selectedCityName || null, // null represents global/state rules if city not selected [cite: custom_context]
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
            if (editingId) {
                // Edit existing record by ObjectID [cite: custom_context]
                response = await AdminAPI.updateAdminDeliveryChargesById(editingId, payload);
            } else {
                // Create a fresh city-specific configuration [cite: custom_context]
                response = await AdminAPI.saveAdminDeliveryCharges(payload);
            }

            if (response && response.success) {
                toast.success(response.message || "Logistics policy saved successfully!");
                setIsModalOpen(false);
                await loadAllConfigs(); // Sync master list
            }
        } catch (err) {
            console.error("Error saving logistics configurations:", err);
            toast.error(err.response?.data?.message || "Failed to finalize pricing rules.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 py-4 pb-12 antialiased select-none text-left">
            <Toaster position="top-right" />
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 flex-shrink-0 shadow-sm">
                        <Truck className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Food Pricing Engine</h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">Configure city-specific delivery thresholds, express dispatch fees, and tax specs for the Food platform [cite: custom_context].</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition active:scale-95"
                    >
                        <PlusCircle size={15} className="stroke-[2.5]" />
                        ADD CITY RATE
                    </button>
                </div>
            </div>

            {/* List Table of Configurations */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retrieving configurations database...</p>
                </div>
            ) : configs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <Utensils size={44} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Active Configurations Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No custom delivery charges are configured. Click on "Add City Rate" to configure your first regional ruleset [cite: custom_context].
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-5 px-6">City / Region</th>
                                    <th className="py-5 px-6">State / Country</th>
                                    <th className="py-5 px-6">Base Deliveries</th>
                                    <th className="py-5 px-6">Packaging &amp; Tax Specs</th>
                                    <th className="py-5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {configs.map((config) => {
                                    return (
                                        <tr key={config._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-[#3d3f96]" />
                                                    <span className="text-xs font-black text-slate-800 tracking-tight">
                                                        {config.city || "Global Default"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-slate-500 font-bold">
                                                {config.state || "National"} ({config.country})
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-slate-800">₹{config.fixedPrice} base fee</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Cover radius: {config.fixedDistance} KM</p>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="space-y-1 text-slate-500 font-bold">
                                                    <p>Pkg Fee: <span className="font-mono text-slate-800">₹{config.packagingCharge}</span></p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">GST: {config.taxPercentage}% • Free above: ₹{config.freeDeliveryThreshold}</p>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <button
                                                    onClick={() => handleEditSelect(config)}
                                                    className="p-1.5 border border-slate-200 text-slate-400 hover:text-[#3d3f96] hover:bg-[#3d3f96]/5 rounded-lg transition cursor-pointer"
                                                    title="Edit configuration"
                                                >
                                                    <Pencil className="w-4 h-4" strokeWidth={2} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- CREATE / EDIT OVERLAY MODAL SHEET --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up flex flex-col max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                        
                        {/* Close Trigger */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-6">
                            
                            {/* Modal Title Header */}
                            <div className="border-b border-slate-50 pb-4 pr-10">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <Truck size={18} className="text-[#3d3f96]" />
                                    {modalMode === 'create' ? 'Add Regional Configuration' : 'Modify Configuration Rates'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Configure distance-based tariffs, tax targets, and flat surcharges for checkout [cite: custom_context].</p>
                            </div>

                            {/* Form Input fields */}
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                
                                {/* Location Dropdowns */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                            <Globe size={11} /> Country *
                                        </label>
                                        <select
                                            value={selectedCountryCode}
                                            onChange={(e) => setSelectedCountryCode(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-[#3d3f96] cursor-pointer"
                                        >
                                            {countries.map(c => (
                                                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                            <Building2 size={11} /> State *
                                        </label>
                                        <select
                                            required
                                            value={selectedStateCode}
                                            onChange={(e) => setSelectedStateCode(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-[#3d3f96] cursor-pointer"
                                        >
                                            <option value="">Select State</option>
                                            {states.map(s => (
                                                <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                            <MapPin size={11} /> City Override
                                        </label>
                                        <select
                                            value={selectedCityName}
                                            onChange={(e) => setSelectedCityName(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-[#3d3f96] cursor-pointer"
                                        >
                                            <option value="">Global/State Default</option>
                                            {cities.map(city => (
                                                <option key={city.name} value={city.name}>{city.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Base Rates */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-4">
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

                                {/* Variable distance and Packaging */}
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

                                {/* Limits and Taxes */}
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

                                {/* Express Delivery options */}
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

                                {/* Modal Actions Footer */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-7 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                                    >
                                        {saving ? <Loader2 size={13} className="animate-spin text-white" /> : null}
                                        <span>{modalMode === 'create' ? 'Create Policy' : 'Save Changes'}</span>
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