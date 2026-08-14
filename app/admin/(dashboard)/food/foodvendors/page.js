"use client";

import { useState, useMemo } from "react";
import { 
    FaUtensils, FaSearch, FaFilter, FaUndo, FaSync, 
    FaGlobeAmericas, FaMapMarkerAlt, FaCity, FaEye, 
    FaUserCheck, FaUserSlash, FaChevronLeft, FaChevronRight, FaCheckCircle, FaBan 
} from "react-icons/fa";

export default function AllFoodVendors() {
    // 1. Standalone Mock Data with exactly 4 realistic food vendors
    const [foodVendors, setFoodVendors] = useState([
        { id: 1, name: "zomato", email: "zomato@yopmail.com", country: "India", state: "Himachal Pradesh", city: "Kangra", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&auto=format&fit=crop", isActive: true },
        { id: 2, name: "Dominos", email: "dominos@yopmail.com", country: "India", state: "Chandigarh", city: "Chandigarh", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop", isActive: true },
        { id: 3, name: "Swiggy", email: "swiggy@yopmail.com", country: "India", state: "Punjab", city: "Ludhiana", image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&auto=format&fit=crop", isActive: true },
        { id: 4, name: "Pizza Hut", email: "pizzahut@yopmail.com", country: "India", state: "Delhi", city: "New Delhi", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=100&auto=format&fit=crop", isActive: false }
    ]);

    // Filter, Search, and Status States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [countryFilter, setCountryFilter] = useState("All");
    const [stateFilter, setStateFilter] = useState("All");
    const [cityFilter, setCityFilter] = useState("All");

    // Theme Color Tokens based on #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // Dynamic filtering logic using useMemo (Location + Search + Status)
    const filteredVendors = useMemo(() => {
        return foodVendors.filter(vendor => {
            const matchesSearch = 
                vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCountry = countryFilter === "All" || vendor.country === countryFilter;
            const matchesState = stateFilter === "All" || vendor.state === stateFilter;
            const matchesCity = cityFilter === "All" || vendor.city === cityFilter;

            let matchesStatus = true;
            if (statusFilter === "Active") matchesStatus = vendor.isActive === true;
            if (statusFilter === "Inactive") matchesStatus = vendor.isActive === false;

            return matchesSearch && matchesCountry && matchesState && matchesCity && matchesStatus;
        });
    }, [foodVendors, searchTerm, countryFilter, stateFilter, cityFilter, statusFilter]);

    // Handler to toggle active/disabled state dynamically
    const toggleVendorStatus = (id) => {
        setFoodVendors(prev => prev.map(vendor => 
            vendor.id === id ? { ...vendor, isActive: !vendor.isActive } : vendor
        ));
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("All");
        setCountryFilter("All");
        setStateFilter("All");
        setCityFilter("All");
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* 1. DYNAMIC REGIONAL LOCATION FILTERS */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                        <FaFilter className="text-lg" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-snug">Active Location Filters</h2>
                        <p className="text-xs text-gray-400">Filter registered food vendors by country, state, and city</p>
                    </div>
                </div>

                {/* Dropdowns Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><FaGlobeAmericas className="text-[#3D3F96]" /> Country</label>
                        <select 
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                        >
                            <option value="All">All Countries</option>
                            <option value="India">India</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><FaMapMarkerAlt className="text-[#3D3F96]" /> State</label>
                        <select 
                            value={stateFilter}
                            onChange={(e) => setStateFilter(e.target.value)}
                            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                        >
                            <option value="All">All States</option>
                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                            <option value="Chandigarh">Chandigarh</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Delhi">Delhi</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><FaCity className="text-[#3D3F96]" /> City</label>
                        <select 
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                        >
                            <option value="All">All Cities</option>
                            <option value="Kangra">Kangra</option>
                            <option value="Chandigarh">Chandigarh</option>
                            <option value="Ludhiana">Ludhiana</option>
                            <option value="New Delhi">New Delhi</option>
                        </select>
                    </div>

                    {/* Filter Controlling Buttons */}
                    <div className="flex gap-2">
                        <button 
                            onClick={handleResetFilters}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                        >
                            <FaUndo className="text-xs" /> Reset
                        </button>
                        <button 
                            className={`flex-1 flex items-center justify-center gap-2 text-white font-bold py-2.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                        >
                            <FaSync className="text-xs animate-spin-slow" /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. ALL FOOD VENDORS LIST CARD */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                
                {/* Table Header Section with Search and Dropdown Status */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#3D3F96]/5 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center">
                            <FaUtensils className="text-lg" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-gray-800">
                            All Food Vendors
                            <span className="ml-2.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3D3F96]/15 text-[#3D3F96]">
                                {filteredVendors.length} Registered
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search Input */}
                        <div className="relative">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name, email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all w-56"
                            />
                        </div>

                        {/* Status Filter Dropdown */}
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Table Scrollable Wrapper */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px] table-auto align-middle">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-center px-6 py-4 w-16">S.No</th>
                                <th className="text-center px-6 py-4 w-20">Image</th>
                                <th className="text-left px-6 py-4">Vendor Name</th>
                                <th className="text-left px-6 py-4">Email</th>
                                <th className="text-center px-6 py-4">Country</th>
                                <th className="text-center px-6 py-4">State</th>
                                <th className="text-center px-6 py-4">City</th>
                                <th className="text-center px-6 py-4">Status</th>
                                <th className="text-center px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredVendors.length > 0 ? (
                                filteredVendors.map((vendor, index) => (
                                    <tr 
                                        key={vendor.id} 
                                        className="hover:bg-gray-50/60 transition-colors duration-150"
                                    >
                                        {/* S.No */}
                                        <td className="px-6 py-4 text-center font-bold text-gray-400 text-xs">
                                            {index + 1}
                                        </td>

                                        {/* Image */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-block relative w-9 h-9 rounded-lg overflow-hidden border border-gray-100 shadow-sm shrink-0">
                                                <img 
                                                    src={vendor.image} 
                                                    alt={vendor.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>

                                        {/* Vendor Name */}
                                        <td className="px-6 py-4 font-bold text-gray-800 tracking-tight capitalize">
                                            {vendor.name}
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-gray-500 font-semibold">
                                            {vendor.email}
                                        </td>

                                        {/* Country */}
                                        <td className="px-6 py-4 text-center text-gray-600 font-bold">
                                            {vendor.country}
                                        </td>

                                        {/* State */}
                                        <td className="px-6 py-4 text-center text-gray-600 font-semibold">
                                            {vendor.state}
                                        </td>

                                        {/* City */}
                                        <td className="px-6 py-4 text-center text-gray-600 font-semibold">
                                            {vendor.city}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-6 py-4 text-center">
                                            {vendor.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                                    <FaCheckCircle className="text-[9px]" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wide">
                                                    <FaBan className="text-[9px]" /> Inactive
                                                </span>
                                            )}
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Enable/Disable status toggle */}
                                                <button
                                                    onClick={() => toggleVendorStatus(vendor.id)}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none ${
                                                        vendor.isActive 
                                                            ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100" 
                                                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100"
                                                    }`}
                                                >
                                                    {vendor.isActive ? (
                                                        <><FaUserSlash /> Disable</>
                                                    ) : (
                                                        <><FaUserCheck /> Enable</>
                                                    )}
                                                </button>
                                                
                                                {/* View Button */}
                                                <button
                                                    onClick={() => alert(`View details of ${vendor.name} (Mock Mode)`)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition-all focus:outline-none"
                                                >
                                                    <FaEye /> View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Empty Filter Results State */
                                <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center text-slate-400 font-semibold text-xs">
                                        No registered food vendors match the chosen filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 3. PREMIUM PAGINATION CONTROLS */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-wrap gap-4">
                    <button 
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                    >
                        <FaChevronLeft className="text-[10px]" /> Previous
                    </button>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Page 1 of 1
                    </span>
                    <button 
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                    >
                        Next <FaChevronRight className="text-[10px]" />
                    </button>
                </div>
            </div>

        </div>
    );
}