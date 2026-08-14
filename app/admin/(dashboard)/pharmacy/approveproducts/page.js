"use client";

import { useState } from "react";
import { 
    FaColumns, FaCheck, FaTimes, FaBoxOpen, 
    FaHospital, FaIndustry, FaInbox, FaBarcode 
} from "react-icons/fa";

export default function HospitalProducts() {
    // Initial Seed Data with realistic healthcare & diabetic products
    const [products, setProducts] = useState([
        { 
            id: 1, 
            name: "Accu-Chek Active Test Strips (50s)", // Standard Diabetes monitoring strips
            manufacturer: "Roche Diagnostics", 
            mrp: 1050, 
            bestPrice: 840, 
            image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=100&auto=format&fit=crop" 
        },
        { 
            id: 2, 
            name: "OneTouch Select Plus Glucometer", // Blood sugar monitoring machine
            manufacturer: "LifeScan India", 
            mrp: 1200, 
            bestPrice: 950, 
            image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=100&auto=format&fit=crop" 
        }
    ]);

    // Column Visibility State
    const [visibleCols, setVisibleColumns] = useState({
        productName: true,
        manufacturer: true,
        mrp: true,
        bestPrice: true,
        image: true,
        actions: true,
    });

    const toggleColumn = (col) => {
        setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
    };

    const handleApprove = (id) => {
        // Remove item dynamically on approval with transition state
        setProducts(prev => prev.filter(prod => prod.id !== id));
    };

    const handleReject = (id) => {
        // Remove item dynamically on rejection
        setProducts(prev => prev.filter(prod => prod.id !== id));
    };

    const formatINR = (n) => {
        return `₹${parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* 1. COLUMN VISIBILITY CARD */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                        <FaColumns className="text-lg" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-snug">Column Visibility</h2>
                        <p className="text-xs text-gray-400">Toggle columns to customize your data grid view</p>
                    </div>
                </div>

                {/* Checkboxes Grid layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={visibleCols.productName} 
                            onChange={() => toggleColumn("productName")}
                            className="w-4.5 h-4.5 text-[#3D3F96] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-[#3D3F96]/30 cursor-pointer accent-[#3D3F96]"
                        />
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">Product Name</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={visibleCols.manufacturer} 
                            onChange={() => toggleColumn("manufacturer")}
                            className="w-4.5 h-4.5 text-[#3D3F96] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-[#3D3F96]/30 cursor-pointer accent-[#3D3F96]"
                        />
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">Manufacturer</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={visibleCols.mrp} 
                            onChange={() => toggleColumn("mrp")}
                            className="w-4.5 h-4.5 text-[#3D3F96] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-[#3D3F96]/30 cursor-pointer accent-[#3D3F96]"
                        />
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">MRP</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={visibleCols.bestPrice} 
                            onChange={() => toggleColumn("bestPrice")}
                            className="w-4.5 h-4.5 text-[#3D3F96] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-[#3D3F96]/30 cursor-pointer accent-[#3D3F96]"
                        />
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">Best Price</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={visibleCols.image} 
                            onChange={() => toggleColumn("image")}
                            className="w-4.5 h-4.5 text-[#3D3F96] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-[#3D3F96]/30 cursor-pointer accent-[#3D3F96]"
                        />
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">Image</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={visibleCols.actions} 
                            onChange={() => toggleColumn("actions")}
                            className="w-4.5 h-4.5 text-[#3D3F96] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-[#3D3F96]/30 cursor-pointer accent-[#3D3F96]"
                        />
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">Actions</span>
                    </label>
                </div>
            </div>

            {/* 2. PENDING PRODUCTS DATA TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                
                {/* Table Header Section */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#3D3F96]/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center">
                            <FaHospital className="text-lg animate-pulse" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-gray-800">
                            Hospital Products 
                            <span className="ml-2.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3D3F96]/15 text-[#3D3F96]">
                                {products.length} Pending
                            </span>
                        </h2>
                    </div>
                </div>

                {/* Main Table Structure */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px] table-auto">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-center px-6 py-4 w-16">S.No</th>
                                {visibleCols.productName && <th className="text-left px-6 py-4">Product Name</th>}
                                {visibleCols.manufacturer && <th className="text-left px-6 py-4">Manufacturer</th>}
                                {visibleCols.mrp && <th className="text-right px-6 py-4">MRP</th>}
                                {visibleCols.bestPrice && <th className="text-right px-6 py-4">Best Price</th>}
                                {visibleCols.image && <th className="text-center px-6 py-4">Image</th>}
                                {visibleCols.actions && <th className="text-center px-6 py-4">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map((item, index) => (
                                <tr 
                                    key={item.id} 
                                    className="hover:bg-gray-50/60 transition-colors duration-200"
                                >
                                    {/* Serial Number */}
                                    <td className="px-6 py-4 text-center font-bold text-gray-400 text-xs">
                                        {index + 1}
                                    </td>

                                    {/* Product Name */}
                                    {visibleCols.productName && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-[#3D3F96]/10 flex items-center justify-center text-[#3D3F96] shrink-0">
                                                    <FaBoxOpen className="text-sm" />
                                                </div>
                                                <span className="font-bold text-gray-800 tracking-tight">{item.name}</span>
                                            </div>
                                        </td>
                                    )}

                                    {/* Manufacturer */}
                                    {visibleCols.manufacturer && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600 font-semibold text-xs">
                                                <FaIndustry className="text-gray-300" />
                                                {item.manufacturer}
                                            </div>
                                        </td>
                                    )}

                                    {/* MRP */}
                                    {visibleCols.mrp && (
                                        <td className="px-6 py-4 text-right font-black tabular-nums text-gray-800">
                                            {formatINR(item.mrp)}
                                        </td>
                                    )}

                                    {/* Best Price */}
                                    {visibleCols.bestPrice && (
                                        <td className="px-6 py-4 text-right font-black tabular-nums text-emerald-600 bg-emerald-50/20">
                                            {formatINR(item.bestPrice)}
                                        </td>
                                    )}

                                    {/* Image Thumbnail */}
                                    {visibleCols.image && (
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-block relative w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                    )}

                                    {/* Action Buttons */}
                                    {visibleCols.actions && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(item.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:scale-105 transition-all focus:outline-none"
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(item.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm hover:bg-rose-700 hover:scale-105 transition-all focus:outline-none"
                                                >
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {/* Empty State when no pending products remain */}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <FaInbox className="text-3xl" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700">No Pending Products</h4>
                                                <p className="text-xs text-slate-400 mt-1">All requested products have been processed successfully.</p>
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