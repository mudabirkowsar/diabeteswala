"use client";

import { useState, useMemo } from "react";
import { 
    FaTruck, FaSearch, FaFilter, FaGlobeAmericas, FaMapMarkerAlt, 
    FaCity, FaEye, FaHistory, FaInbox, FaFlask, FaPills, FaUtensils 
} from "react-icons/fa";

export default function ManageDrivers() {
    // 1. Standalone Mock Data with realistic changed names and distinct categories (Lab, Pharmacy, Food)
    const [personnel, setPersonnel] = useState([
        { 
            id: "#LB52A9", 
            name: "Karan Malhotra", 
            category: "LAB", 
            username: "@karan.lab", 
            agency: "Heera Diagnostics Service", 
            phone: "9876543210", 
            isActive: true, 
            image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop" 
        },
        { 
            id: "#PH18B2", 
            name: "Vikram Singh", 
            category: "PHARMACY", 
            username: "@vikram.pharmacy", 
            agency: "MedPlus Pharmacy Outlet", 
            phone: "8765432109", 
            isActive: true, 
            image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop" 
        },
        { 
            id: "#FD89C4", 
            name: "Rahul Mehta", 
            category: "FOOD", 
            username: "@rahul.delivery", 
            agency: "Zomato Fleet Services", 
            phone: "7654321098", 
            isActive: true, 
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop" 
        },
        { 
            id: "#FD12A3", 
            name: "Suresh Kumar", 
            category: "FOOD", 
            username: "@suresh.fleet", 
            agency: "Dominos Delivery Fleet", 
            phone: "6543210987", 
            isActive: false, 
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop" 
        }
    ]);

    // Filter, Search, and Category Tab States
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTab, setSelectedTab] = useState("ALL"); // ALL, LAB, PHARMACY, FOOD
    const [selectedCountry, setSelectedCountry] = useState("All Countries");
    const [selectedState, setSelectedState] = useState("All States");
    const [selectedCity, setSelectedCity] = useState("All Cities");

    // Theme Color Tokens based on #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // Dynamic filtering using useMemo
    const filteredPersonnel = useMemo(() => {
        return personnel.filter(p => {
            const matchesSearch = 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.agency.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesTab = selectedTab === "ALL" || p.category === selectedTab;

            return matchesSearch && matchesTab;
        });
    }, [personnel, searchTerm, selectedTab]);

    // Handler to toggle Availability (Active/Inactive)
    const toggleAvailability = (id) => {
        setPersonnel(prev => prev.map(p => 
            p.id === id ? { ...p, isActive: !p.isActive } : p
        ));
    };

    // Helper for Category Badges
    const getCategoryBadge = (category) => {
        switch (category) {
            case "LAB":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-100 uppercase tracking-wider">
                        <FaFlask className="text-[9px]" /> Lab
                    </span>
                );
            case "PHARMACY":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                        <FaPills className="text-[9px]" /> Pharmacy
                    </span>
                );
            case "FOOD":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                        <FaUtensils className="text-[9px]" /> Food
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* 1. TOP HEADER SECTION */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                    <FaTruck className="text-xl" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Manage Drivers</h2>
                    <p className="text-xs text-gray-400">Review, edit, and configure driver &amp; delivery personnel settings</p>
                </div>
            </div>

            {/* 2. SEARCH & TAB CATEGORY FILTER */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col lg:flex-row items-center justify-between gap-6">
                
                {/* Search Input Box */}
                <div className="relative w-full lg:w-96">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, vendor, or phone..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-9 pr-4 py-2 w-full rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                    />
                </div>

                {/* Categories Tab Buttons (Only ALL, LAB, PHARMACY, FOOD) */}
                <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
                    {["ALL", "LAB", "PHARMACY", "FOOD"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none ${
                                selectedTab === tab 
                                    ? `${themeBg} text-white shadow-lg ${themeShadow}` 
                                    : "bg-white hover:bg-gray-50 text-gray-500 border border-gray-200"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. GEO LOCATION MATRIX PANEL */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row items-center gap-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 shrink-0">
                    <FaFilter className={themeText} /> Geo Location Matrix:
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                        <FaGlobeAmericas className="text-gray-400 text-sm shrink-0" />
                        <select 
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="bg-transparent text-xs font-bold text-gray-600 outline-none w-full cursor-pointer"
                        >
                            <option value="All Countries">ALL COUNTRIES</option>
                            <option value="India">INDIA</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                        <FaMapMarkerAlt className="text-gray-400 text-sm shrink-0" />
                        <select 
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="bg-transparent text-xs font-bold text-gray-600 outline-none w-full cursor-pointer"
                        >
                            <option value="All States">ALL STATES</option>
                            <option value="Punjab">PUNJAB</option>
                            <option value="Chandigarh">CHANDIGARH</option>
                            <option value="Delhi">DELHI</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                        <FaCity className="text-gray-400 text-sm shrink-0" />
                        <select 
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="bg-transparent text-xs font-bold text-gray-600 outline-none w-full cursor-pointer"
                        >
                            <option value="All Cities">ALL CITIES</option>
                            <option value="Mohali">MOHALI</option>
                            <option value="Chandigarh">CHANDIGARH</option>
                            <option value="New Delhi">NEW DELHI</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 4. DRIVERS DATA GRID TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px] table-auto align-middle">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 w-32">Personnel ID</th>
                                <th className="text-center px-6 py-4 w-28">Duty Identity</th>
                                <th className="text-left px-6 py-4">Name &amp; Classification</th>
                                <th className="text-left px-6 py-4">Vendor / Agency</th>
                                <th className="text-center px-6 py-4 w-40">Availability</th>
                                <th className="text-center px-6 py-4 w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPersonnel.length > 0 ? (
                                filteredPersonnel.map((p) => (
                                    <tr 
                                        key={p.id}
                                        className="hover:bg-gray-50/60 transition-colors duration-150"
                                    >
                                        {/* Personnel ID */}
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-50 text-gray-400 font-bold px-2.5 py-1 rounded-lg text-[10.5px] border border-gray-100">
                                                {p.id}
                                            </span>
                                        </td>

                                        {/* Duty Identity (Avatar + status indicator) */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-block relative w-10 h-10 rounded-full border border-gray-100 shadow-sm shrink-0">
                                                <img 
                                                    src={p.image} 
                                                    alt={p.name} 
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                                <span className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-white ${p.isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                                            </div>
                                        </td>

                                        {/* Name & Classification */}
                                        <td className="px-6 py-4">
                                            <h3 className="font-bold text-gray-800 tracking-tight leading-none">{p.name}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                {getCategoryBadge(p.category)}
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{p.username}</span>
                                            </div>
                                        </td>

                                        {/* Vendor / Agency */}
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-800 tracking-tight leading-none">{p.agency}</p>
                                            <p className="text-[10.5px] text-gray-400 font-bold uppercase tracking-wider mt-1">{p.phone}</p>
                                        </td>

                                        {/* Availability (Active Toggle Switch) */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-3">
                                                {/* Customized sliding toggle */}
                                                <button
                                                    onClick={() => toggleAvailability(p.id)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                        p.isActive ? "bg-emerald-500" : "bg-gray-200"
                                                    }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                            p.isActive ? "translate-x-5" : "translate-x-0"
                                                        }`}
                                                    />
                                                </button>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${p.isActive ? "text-emerald-600" : "text-gray-400"}`}>
                                                    {p.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => alert(`Viewing details of ${p.name} (Mock Mode)`)}
                                                    className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all focus:outline-none"
                                                    title="View Details"
                                                >
                                                    <FaEye className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => alert(`Reset history for ${p.name} (Mock Mode)`)}
                                                    className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all focus:outline-none"
                                                    title="Reset / History"
                                                >
                                                    <FaHistory className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Empty Filter Results State */
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <FaInbox className="text-3xl" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700">No Personnel Found</h4>
                                                <p className="text-xs text-slate-400 mt-1">Adjust your search parameters or select different location options.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}