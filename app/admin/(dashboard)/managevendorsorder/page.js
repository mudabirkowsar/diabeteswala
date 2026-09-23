"use client";

import { useState } from "react";
import {
    FlaskConical,
    Pill,
    UtensilsCrossed,
    Truck,
    HeartHandshake,
    Activity,
    Building2,
    Sparkles,
    CheckCircle2
} from "lucide-react";

// Existing Component Imports
import LabVendorOrders from "./components/LabVendorOrders";
import PharmacyVendorOrders from "./components/PharmacyVendorOrders";
import FoodVendorOrders from "./components/FoodVendorOrders";

// Fallback View for remaining categories
function GenericVendorOrdersFallback({ title, icon: Icon }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 text-center flex flex-col items-center justify-center space-y-3 select-none">
            <div className="w-14 h-14 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <h3 className="text-base font-black text-slate-800">{title} Portal</h3>
                <p className="text-xs text-slate-400 mt-0.5">Orders and vendors are actively syncing for this channel.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Sparkles className="w-3 h-3" /> Channel Operational
            </span>
        </div>
    );
}

export default function ManageVendorOrdersPage() {
    const [activeTab, setActiveTab] = useState("lab");

    // All Vendor Categories in one clean configuration
    const vendorCategories = [
        { id: "lab", label: "Lab Diagnostics", count: 4, icon: FlaskConical },
        { id: "pharmacy", label: "Pharmacies", count: 4, icon: Pill },
        { id: "food", label: "Food Outlets", count: 4, icon: UtensilsCrossed },
        { id: "ambulance", label: "Ambulance", count: 2, icon: Truck },
        { id: "homecare", label: "Home Care", count: 3, icon: HeartHandshake },
        { id: "devices", label: "Equipment", count: 2, icon: Activity }
    ];

    const activeCategoryData = vendorCategories.find((cat) => cat.id === activeTab);

    return (
        <div className="min-h-screen text-slate-800 antialiased selection:bg-[#3D3F96] selection:text-white pb-12">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* 1. COMPACT PILL-SHAPED TAB BAR (All Tabs Visible in 1 Row) */}
                <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70 shadow-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 w-full">
                        {vendorCategories.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none ${isActive
                                            ? "bg-[#3D3F96] text-white shadow-md shadow-[#3D3F96]/20 font-black"
                                            : "bg-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900"
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                                    <span className="truncate">{tab.label}</span>

                                    {/* Compact Count Badge */}
                                    <span
                                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-200/80 text-slate-500"
                                            }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. SLENDER ACTIVE CONTEXT STRIP */}
                <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3D3F96] animate-pulse"></span>
                        <span>
                            Managing: <strong className="text-slate-900 font-bold">{activeCategoryData?.label}</strong> ({activeCategoryData?.count} Verified)
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Live Channel
                    </div>
                </div>

                {/* 3. DYNAMIC CONTENT SECTION */}
                <div className="animate-in fade-in-50 duration-150">
                    {activeTab === "lab" && <LabVendorOrders />}
                    {activeTab === "pharmacy" && <PharmacyVendorOrders />}
                    {activeTab === "food" && <FoodVendorOrders />}

                    {/* Graceful Fallback for new unconfigured tabs */}
                    {!["lab", "pharmacy", "food"].includes(activeTab) && (
                        <GenericVendorOrdersFallback
                            title={activeCategoryData?.label}
                            icon={activeCategoryData?.icon || Building2}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}