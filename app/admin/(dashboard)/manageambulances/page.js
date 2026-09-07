"use client";

import React, { useState } from 'react';
import {
    Truck,
    Activity,
    ShieldAlert,
    Sparkles
} from 'lucide-react';

// Import sub-components from local ./components folder
import AmbulanceVendor from './components/AmbulanceVendor';
import ClinicalAmbulances from './components/ClinicalAmbulances';

const AMBULANCE_TABS = [
    {
        id: 'vendor',
        label: 'Ambulance Vendor',
        badge: 'Fleet Partners',
        icon: Truck,
        component: AmbulanceVendor
    },
    {
        id: 'clinical',
        label: 'Clinical Ambulance',
        badge: 'ICU & Emergency',
        icon: Activity,
        component: ClinicalAmbulances
    }
];

export default function AmbulanceManagementPage() {
    // Active Tab State (Default: 'vendor')
    const [activeTab, setActiveTab] = useState('vendor');

    // Retrieve active component dynamically
    const ActiveComponent = AMBULANCE_TABS.find((tab) => tab.id === activeTab)?.component || AmbulanceVendor;

    return (
        <div className="max-w-[1400px] mx-auto py-0 space-y-0 select-none antialiased text-left text-slate-800">

            {/* --- HEADER SECTION & NAVTAB SWITCHER --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">

                {/* Title & Branding */}
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/15 shadow-sm shrink-0">
                        <ShieldAlert size={24} strokeWidth={2.2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Ambulance Fleet Control
                            </h1>
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-600 bg-red-50/60 border border-red-200/60 px-2.5 py-0.5 rounded-full shadow-xs">
                                <Sparkles size={11} className="animate-pulse" /> Emergency Live
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                            Manage partner vehicle operators, advanced life-support ambulances, and on-demand dispatch networks.
                        </p>
                    </div>
                </div>

                {/* Segmented NavTabs Bar */}
                <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl gap-1.5 border border-slate-200/80 shadow-inner overflow-x-auto max-w-full [&::-webkit-scrollbar]:hidden">
                    {AMBULANCE_TABS.map((tab) => {
                        const TabIcon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 shrink-0 border cursor-pointer ${isActive
                                    ? 'bg-red-50/60 text-red-600 border-red-200/60 shadow-sm shadow-red-100/50 scale-[1.01]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/55'
                                    }`}
                            >
                                <TabIcon
                                    size={15}
                                    className={isActive ? 'text-red-600' : 'text-slate-400'}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span>{tab.label}</span>

                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase hidden sm:inline-block border ${isActive
                                    ? 'bg-red-100/80 border-red-200/60 text-red-600'
                                    : 'bg-slate-200 border-transparent text-slate-500'
                                    }`}>
                                    {tab.badge}
                                </span>
                            </button>
                        );
                    })}
                </div>

            </div>

            {/* --- TAB CONTENT AREA --- */}
            <div className="transition-all duration-300">
                <div key={activeTab} className="animate-in fade-in duration-200">
                    <ActiveComponent />
                </div>
            </div>

        </div>
    );
}