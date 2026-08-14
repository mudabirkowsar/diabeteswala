"use client";

import React, { useState } from "react";
import { 
    FaChartBar, FaTachometerAlt, FaStore, FaCog, FaInfoCircle, 
    FaUserMd, FaCrown, FaStethoscope, FaBrain, FaLightbulb, FaQuestionCircle, 
    FaBook, FaVideo, FaHeadphones 
} from "react-icons/fa";

// Import your sub-components (Ensure paths are correct in your project)
// import RevenueSummary from "./RevenueSummary";
// import AdminSummary from "./RevenueAdmin";
// import VendorEarnings from "./VendorEarnings";
import CutoffSettingsPanel from "../component/CutoffSettings";

const Revenue = () => {
    const [activeTab, setActiveTab] = useState("revenue");
    const [showHelpDropdown, setShowHelpDropdown] = useState(false);

    // Theme Color Configurations
    const themeBg = "bg-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeText = "text-[#3D3F96]";
    const themeBorder = "border-[#3D3F96]";
    const themeShadow = "shadow-[#3D3F96]/20";

    const tabs = [
        { key: "revenue", label: "Revenue Summary", icon: <FaChartBar className="text-base" /> },
        { key: "admin-summary", label: "All Orders", icon: <FaTachometerAlt className="text-base" /> },
        { key: "vendor-earnings", label: "Vendor Earnings", icon: <FaStore className="text-base" /> },
        { key: "cutoff-settings", label: "Cutoff Settings", icon: <FaCog className="text-base" /> }
    ];

    const renderContent = () => {
        switch (activeTab) {
            // case "revenue":
            //     return <RevenueSummary />;
            // case "admin-summary":
            //     return <AdminSummary />;
            // case "vendor-earnings":
            //     return <VendorEarnings />;
            case "cutoff-settings":
                return <CutoffSettings />;
            default:
                // return <RevenueSummary />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 select-none animate-fadeIn">
            
            {/* PAGE HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Revenue Management</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage platform revenue, cutoff settings, and vendor earnings</p>
                </div>
                <div className="flex shrink-0">
                    <span className="inline-flex items-center gap-2 bg-[#3D3F96]/10 text-[#3D3F96] text-xs font-bold px-4 py-2.5 rounded-full uppercase tracking-wider">
                        <FaInfoCircle className="text-sm" />
                        Free consultations use Membership cutoff
                    </span>
                </div>
            </div>

            {/* QUICK STATS CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Doctor Orders Card */}
                <div className="bg-white rounded-2xl p-5 border border-l-4 border-l-blue-600 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.012)] flex items-center justify-between hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Doctor Orders</span>
                        <h3 className="text-2xl font-black text-gray-800 mt-1">Mixed</h3>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">Paid + Free Consultations</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <FaUserMd className="text-2xl" />
                    </div>
                </div>

                {/* Membership Cutoff Card */}
                <div className="bg-white rounded-2xl p-5 border border-l-4 border-l-emerald-500 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.012)] flex items-center justify-between hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Membership Cutoff</span>
                        <h3 className="text-2xl font-black text-emerald-600 mt-1">20%</h3>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">Used for free consultations</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <FaCrown className="text-2xl" />
                    </div>
                </div>

                {/* Doctor Cutoff Card */}
                <div className="bg-white rounded-2xl p-5 border border-l-4 border-l-sky-500 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.012)] flex items-center justify-between hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Doctor Cutoff</span>
                        <h3 className="text-2xl font-black text-sky-600 mt-1">5%</h3>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">Used for paid consultations</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                        <FaStethoscope className="text-2xl" />
                    </div>
                </div>

                {/* Cutoff Logic Card */}
                <div className="bg-white rounded-2xl p-5 border border-l-4 border-l-amber-500 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.012)] flex items-center justify-between hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Cutoff Logic</span>
                        <h3 className="text-2xl font-black text-amber-600 mt-1">Automatic</h3>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">Smart cutoff selection</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                        <FaBrain className="text-2xl" />
                    </div>
                </div>
            </div>

            {/* INFORMATION BANNER (Smart Cutoff Banner) */}
            <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FaLightbulb className="text-xl" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-800 leading-snug">Smart Cutoff System</h4>
                    <p className="text-sm text-slate-600">
                        <strong>Free Consultations:</strong> Use <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Membership Cutoff (20%)</span> &nbsp;|&nbsp;
                        <strong>Paid Consultations:</strong> Use <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700">Doctor Cutoff (5%)</span>
                    </p>
                    <p className="text-xs text-slate-400 pt-0.5">The system automatically detects free consultations and applies the appropriate cutoff percentage dynamically.</p>
                </div>
            </div>

            {/* TAB SELECTION HEADER CARD */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Responsive Pill Tabs */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
                                activeTab === tab.key 
                                    ? `${themeBg} text-white shadow-lg ${themeShadow}` 
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Help Dropdown Button */}
                <div className="relative self-end md:self-auto" onMouseLeave={() => setShowHelpDropdown(false)}>
                    <button 
                        onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-all focus:outline-none"
                    >
                        <FaQuestionCircle className="text-base text-gray-400" />
                        Help
                    </button>
                    {showHelpDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col z-20 animate-in fade-in duration-200">
                            <button className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 rounded-xl text-left"><FaBook /> Documentation</button>
                            <button className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 rounded-xl text-left"><FaVideo /> Tutorial</button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 rounded-xl text-left"><FaHeadphones /> Support</button>
                        </div>
                    )}
                </div>
            </div>

            {/* TAB CONTENT HOUSING */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="p-6 md:p-8">
                    {renderContent()}
                </div>
            </div>

            {/* SYSTEM DOCUMENTATION SUMMARY FOOTER */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.012)]">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FaInfoCircle className={themeText} /> Cutoff System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2.5 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                            <span><strong>Membership Cutoff:</strong> Applied to FREE consultations</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                            <span><strong>Doctor Cutoff:</strong> Applied to PAID consultations</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                            <span><strong>Clinic Cutoff:</strong> Applied to clinic appointments</span>
                        </li>
                    </ul>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2.5 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                            <span>Original consultation fee is stored for all appointments</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                            <span>Separate revenue tracking for free vs paid models</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                            <span>Detailed financial breakdowns available instantly</span>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    );
};

export default Revenue;