"use client";

import React, { useState } from "react";
import MedicineRequest from "./components/MedicineRequest";
import HikeRequest from "./components/HikeRequest";
import { FaPills, FaChartLine } from "react-icons/fa";

export default function Page() {
    const [activeTab, setActiveTab] = useState("medicine");
    const themeColor = "#3D3F96";

    const tabs = [
        {
            id: "medicine",
            label: "Medicine Request",
            icon: <FaPills className="text-sm" />,
        },
        {
            id: "hike",
            label: "Hike Request",
            icon: <FaChartLine className="text-sm" />,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header with Title & Nav Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">
                            Pharmacy Requests
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider mt-1">
                            Manage medicine orders & price hike requests
                        </p>
                    </div>

                    {/* Segmented Tab Switcher */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/60 self-start sm:self-auto">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    type="button"
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 focus:outline-none ${isActive
                                            ? "text-white shadow-md active:scale-95"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-white/70"
                                        }`}
                                    style={{
                                        backgroundColor: isActive ? themeColor : "transparent",
                                    }}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content Display */}
                <div className="transition-all duration-300">
                    {activeTab === "medicine" ? (
                        <MedicineRequest />
                    ) : (
                        <HikeRequest />
                    )}
                </div>

            </div>
        </div>
    );
}