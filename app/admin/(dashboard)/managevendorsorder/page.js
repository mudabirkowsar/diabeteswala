"use client";

import { useState } from "react";
import {
    FlaskConical,
    Pill,
    UtensilsCrossed,
    Truck,
    HeartHandshake,
    Building2,
    Stethoscope,
    Sparkles,
    CheckCircle2,
    Layers
} from "lucide-react";

// Existing Component Imports
import LabVendorOrders from "./components/LabVendorOrders";
import PharmacyVendorOrders from "./components/PharmacyVendorOrders";
import FoodVendorOrders from "./components/FoodVendorOrders";
import IndependentDoctor from "./components/IndependentDoctor";
import ClinicVendorOrders from "./components/ClinicVendorOrders";
import AmbulanceOrders from "./components/AmbulanceOrders";
import CoachOrders from "./components/CoachOrders";

// Fallback View for remaining/unconfigured categories
function GenericVendorOrdersFallback({ title, icon: Icon }) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-12 text-center flex flex-col items-center justify-center space-y-3 select-none">
            <div className="w-14 h-14 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/20 shadow-xs">
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">{title} Portal</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Orders and vendors are actively syncing for this channel.
                </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-500" /> Channel Operational
            </span>
        </div>
    );
}

export default function ManageVendorOrdersPage() {
    const [activeTab, setActiveTab] = useState("lab");

    // All 7 Vendor Categories with accurate semantic icons
    const vendorCategories = [
        { id: "lab", label: "Lab Diagnostics", icon: FlaskConical },
        { id: "pharmacy", label: "Pharmacies", icon: Pill },
        { id: "food", label: "Food Outlets", icon: UtensilsCrossed },
        { id: "independentdoctor", label: "Doctors (OPD)", icon: Stethoscope },
        { id: "clinicorders", label: "Clinic Orders", icon: Building2 },
        { id: "ambulanceorders", label: "Ambulance", icon: Truck },
        { id: "coachorders", label: "Coach Sessions", icon: HeartHandshake }
    ];

    const activeCategoryData = vendorCategories.find((cat) => cat.id === activeTab);

    return (
        <div className="min-h-screen text-slate-800 antialiased selection:bg-[#3D3F96] selection:text-white pb-14 text-left">
            <div className="max-w-[1400px] mx-auto space-y-5">

                {/* 1. COMPACT RESPONSIVE TAB BAR (All 7 Tabs in 1 Row on Desktop) */}
                <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto scrollbar-none">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 min-w-[650px] lg:min-w-full">
                        {vendorCategories.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none focus:outline-none ${isActive
                                            ? "bg-[#3D3F96] text-white shadow-sm shadow-[#3D3F96]/30 font-black"
                                            : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <Icon
                                        className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                                            }`}
                                    />
                                    <span className="truncate">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. ACTIVE CONTEXT STRIP */}
                <div className="flex items-center justify-between px-2 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3D3F96] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3D3F96]"></span>
                        </span>
                        <span>
                            Active Channel:{" "}
                            <strong className="text-slate-900 font-black tracking-tight">
                                {activeCategoryData?.label}
                            </strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Live System</span>
                    </div>
                </div>

                {/* 3. DYNAMIC CONTENT SECTION */}
                <div className="animate-in fade-in-50 duration-150">
                    {activeTab === "lab" && <LabVendorOrders />}
                    {activeTab === "pharmacy" && <PharmacyVendorOrders />}
                    {activeTab === "food" && <FoodVendorOrders />}
                    {activeTab === "independentdoctor" && <IndependentDoctor />}
                    {activeTab === "clinicorders" && <ClinicVendorOrders />}
                    {activeTab === "ambulanceorders" && <AmbulanceOrders />}
                    {activeTab === "coachorders" && <CoachOrders />}

                    {/* Graceful Fallback for Unconfigured Tabs */}
                    {![
                        "lab",
                        "pharmacy",
                        "food",
                        "independentdoctor",
                        "clinicorders",
                        "ambulanceorders",
                        "coachorders"
                    ].includes(activeTab) && (
                            <GenericVendorOrdersFallback
                                title={activeCategoryData?.label || "Orders"}
                                icon={activeCategoryData?.icon || Layers}
                            />
                        )}
                </div>

            </div>
        </div>
    );
}