"use client";

import React, { useState, useEffect } from 'react';
import { 
    Coins, 
    Loader2, 
    Activity, 
    Pill, 
    Utensils, 
    Building2, 
    User, 
    Truck, 
    ShieldCheck, 
    AlertCircle 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import Admin API service functions
import AdminAPI from '../../../../services/AdminAPI'; // Adjust relative path based on folder depth

// --- Brand Asset Mappings for the 6 Vendor Channels ---
const VENDOR_META = {
    Lab: {
        icon: <Activity className="w-5 h-5 text-blue-600" />,
        bg: 'bg-blue-50/60',
        border: 'border-blue-100/50',
        desc: 'Diagnostic blood works, radiology scans, and clinical profile packages.'
    },
    Pharmacy: {
        icon: <Pill className="w-5 h-5 text-purple-600" />,
        bg: 'bg-purple-50/60',
        border: 'border-purple-100/50',
        desc: 'Prescription medicines, wellness supplements, and dynamic healthcare OTC products.'
    },
    Food: {
        icon: <Utensils className="w-5 h-5 text-emerald-600" />,
        bg: 'bg-emerald-50/60',
        border: 'border-emerald-100/50',
        desc: 'Dietitian-approved therapeutic meal plans, keto bowls, and tiffin bundles.'
    },
    Clinic: {
        icon: <Building2 className="w-5 h-5 text-indigo-600" />,
        bg: 'bg-indigo-50/60',
        border: 'border-indigo-100/50',
        desc: 'In-person clinic visits, outpatient therapy centers, and clinical checkups.'
    },
    Doctor: {
        icon: <User className="w-5 h-5 text-amber-600" />,
        bg: 'bg-amber-50/60',
        border: 'border-amber-100/50',
        desc: 'Online video consultations, teleconsultations, and specialist bookings.'
    },
    Ambulance: {
        icon: <Truck className="w-5 h-5 text-rose-600" />,
        bg: 'bg-rose-50/60',
        border: 'border-rose-100/50',
        desc: 'Emergency transport services, cardiac life support, and patient transfers.'
    }
};

export default function CodPolicyConfigPage() {
    // --- Data & Loading States ---
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [togglingType, setTogglingType] = useState(null); // Tracks localized loading spinners per card

    // --- Fetch COD Configurations ---
    const fetchCodConfigs = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getAllVendorsCodConfig();
            if (response && response.success) {
                setConfigs(response.data || []);
            }
        } catch (err) {
            console.error("Error retrieving COD policies:", err);
            toast.error("Failed to load global payment configuration rules.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodConfigs();
    }, []);

    // --- Toggle COD Status Handler ---
    const handleToggleCOD = async (vendorType, currentStatus) => {
        setTogglingType(vendorType);
        const nextStatus = !currentStatus;
        try {
            const response = await AdminAPI.toggleVendorCodStatus({
                vendorType,
                isCodAvailable: nextStatus
            });
            if (response && response.success) {
                toast.success(response.message || `${vendorType} COD policy updated successfully!`);
                await fetchCodConfigs(); // Re-fetch to sync master list
            }
        } catch (err) {
            console.error(`Error toggling COD for ${vendorType}:`, err);
            toast.error(err.response?.data?.message || `Failed to update ${vendorType} COD policy.`);
        } finally {
            setTogglingType(null);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 py-4 pb-12 antialiased select-none text-left">
            <Toaster position="top-right" />
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 flex-shrink-0 shadow-sm">
                        <Coins className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">COD Policy Configurations</h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">Manage dynamic Cash on Delivery (COD) payment rules across all system vendor channels.</p>
                    </div>
                </div>
            </div>

            {/* Configs Dashboard List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retrieving payment configurations...</p>
                </div>
            ) : configs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <Coins size={44} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Payment Configurations Configured</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No operational configurations are currently initialized in the database. Please verify backend payment schemas.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {configs.map((config) => {
                        const meta = VENDOR_META[config.vendorType] || {
                            icon: <Coins className="w-5 h-5 text-slate-600" />,
                            bg: 'bg-slate-50',
                            border: 'border-slate-100',
                            desc: 'Standard system delivery vendor channel configurations.'
                        };

                        const isCodActive = config.isCodAvailable;
                        const isToggling = togglingType === config.vendorType;

                        return (
                            <div 
                                key={config.vendorType}
                                className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm flex flex-col justify-between space-y-5"
                            >
                                <div className="space-y-4">
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.border} border flex items-center justify-center`}>
                                                {meta.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">
                                                    {config.vendorType} Channel
                                                </h3>
                                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-1">
                                                    Payment Gateway Rules
                                                </span>
                                            </div>
                                        </div>

                                        {/* Local Active Status badge */}
                                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border ${
                                            isCodActive 
                                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                                : 'bg-rose-50 border-rose-100 text-red-600'
                                        }`}>
                                            {isCodActive ? 'COD Active' : 'Online Only'}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                        {meta.desc}
                                    </p>
                                </div>

                                {/* Active Configuration Controls */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-1.5 max-w-[200px]">
                                        {isCodActive ? (
                                            <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                        )}
                                        <p className="text-[10px] font-bold text-slate-400 leading-tight">
                                            {isCodActive 
                                                ? "Users can choose Cash On Delivery during checkout."
                                                : "Users will be forced to pay online to complete booking."}
                                        </p>
                                    </div>

                                    {/* Dynamic Sliding Toggle Switch */}
                                    <div className="flex items-center shrink-0">
                                        {isToggling ? (
                                            <Loader2 size={16} className="animate-spin text-[#3d3f96]" />
                                        ) : (
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isCodActive}
                                                    onChange={() => handleToggleCOD(config.vendorType, isCodActive)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3d3f96]" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}