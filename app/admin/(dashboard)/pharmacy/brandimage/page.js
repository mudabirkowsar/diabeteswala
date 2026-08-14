"use client";

import { useState, useEffect } from "react";
import { 
    FaImages, FaPlus, FaCalendarAlt, FaTrash, FaEdit, 
    FaTimes, FaCheck, FaInfoCircle, FaUpload, FaInbox, FaArrowRight 
} from "react-icons/fa";

export default function BrandImagesManagement() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);

    // Form inputs state for Mock uploads
    const [newBrandName, setNewBrandName] = useState("");
    const [newBrandImage, setNewBrandImage] = useState("");

    // Royal Indigo theme configurations
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeBorder = "border-[#3D3F96]";
    const themeShadow = "shadow-[#3D3F96]/20";

    // Initial realistic Brand data with standard pharma logos matching your screen
    const [brands, setBrands] = useState([
        { 
            id: 1, 
            name: "Vaidyanath", 
            imageUrl: "https://images.unsplash.com/photo-1611079830570-2a88062116f1?w=400&auto=format&fit=crop", 
            date: "Dec 6, 2025", 
            status: "Active" 
        },
        { 
            id: 2, 
            name: "Dettol", 
            imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop", 
            date: "Dec 6, 2025", 
            status: "Active" 
        },
        { 
            id: 3, 
            name: "Zingavita", 
            imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop", 
            date: "Dec 6, 2025", 
            status: "Active" 
        },
        { 
            id: 4, 
            name: "Era V", 
            imageUrl: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop", 
            date: "Dec 5, 2025", 
            status: "Active" 
        },
        { 
            id: 5, 
            name: "Himalaya", 
            imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d304a2906?w=400&auto=format&fit=crop", 
            date: "Dec 4, 2025", 
            status: "Active" 
        },
        { 
            id: 6, 
            name: "Cetaphil", 
            imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop", 
            date: "Dec 3, 2025", 
            status: "Active" 
        }
    ]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Simulated handler to create/upload a brand image card dynamically
    const handleAddBrandSubmit = (e) => {
        e.preventDefault();
        if (!newBrandName) return;

        const newId = brands.length > 0 ? Math.max(...brands.map(b => b.id)) + 1 : 1;
        const fallbackImg = newBrandImage || "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop";

        const newBrand = {
            id: newId,
            name: newBrandName,
            imageUrl: fallbackImg,
            date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
            status: "Active"
        };

        setBrands([newBrand, ...brands]);
        setNewBrandName("");
        setNewBrandImage("");
        setShowUploadModal(false);
    };

    const handleDeleteBrand = (id) => {
        if (window.confirm("Are you sure you want to delete this brand logo?")) {
            setBrands(prev => prev.filter(b => b.id !== id));
        }
    };

    const handleEditClick = (brand) => {
        setEditingBrand(brand);
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        setBrands(prev => prev.map(b => b.id === editingBrand.id ? editingBrand : b));
        setShowEditModal(false);
        setEditingBrand(null);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* 1. BRAND HEADER CARD */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                        <FaImages className="text-lg" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-snug">Brand Images Management</h2>
                        <p className="text-xs text-gray-400">Upload and manage brand images for pharmacy directory listing</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#3D3F96]/10 text-[#3D3F96]">
                        {brands.length} Images
                    </span>
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className={`flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                    >
                        <FaPlus className="text-xs" /> Upload New Image
                    </button>
                </div>
            </div>

            {/* 2. BRANDS LOGOS GRID LAYOUT */}
            {brands.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {brands.map((brand) => (
                        <div 
                            key={brand.id}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.012)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                        >
                            {/* Brand Image wrapper with overlay active status */}
                            <div className="relative w-full h-40 bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100 shrink-0">
                                <img 
                                    src={brand.imageUrl} 
                                    alt={brand.name} 
                                    className="max-h-full max-w-full object-contain rounded-lg"
                                />
                                {brand.status === "Active" && (
                                    <span className="absolute top-3 right-3 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                        Active
                                    </span>
                                )}
                            </div>

                            {/* Brand Card Info Body */}
                            <div className="p-5 flex flex-col flex-1 justify-between">
                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-gray-800">{brand.name}</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                                        <FaCalendarAlt className="text-[#3D3F96]" />
                                        {brand.date}
                                    </div>
                                </div>

                                {/* Custom Outline Action Buttons */}
                                <div className="flex items-center gap-2 mt-auto">
                                    <button 
                                        onClick={() => handleEditClick(brand)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-gray-200 text-gray-600 hover:bg-[#3D3F96]/10 hover:text-[#3D3F96] hover:border-[#3D3F96]/30 transition-all focus:outline-none"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteBrand(brand.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all focus:outline-none"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State Screen when no brands exist */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-16 text-center max-w-lg mx-auto">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <FaInbox className="text-3xl" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-700">No Brand Images Found</h4>
                            <p className="text-xs text-slate-400 mt-1">Upload brand logos to get started.</p>
                        </div>
                        <button 
                            onClick={() => setShowUploadModal(true)}
                            className={`mt-4 flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg}`}
                        >
                            <FaPlus className="text-xs" /> Upload Brand Logo
                        </button>
                    </div>
                </div>
            )}

            {/* 3. UPLOAD NEW BRAND MODAL (Mock functional popup) */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center shrink-0">
                                    <FaUpload className="text-lg" />
                                </div>
                                <h3 className="text-base font-black tracking-tight text-gray-800">Upload New Brand</h3>
                            </div>
                            <button 
                                onClick={() => setShowUploadModal(false)}
                                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors focus:outline-none"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Form Content */}
                        <form onSubmit={handleAddBrandSubmit} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter brand name (e.g. Dettol)" 
                                    required
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Logo Image URL</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter logo image URL (Optional)" 
                                    value={newBrandImage}
                                    onChange={(e) => setNewBrandImage(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all"
                                />
                            </div>

                            {/* Modal Footer Controls */}
                            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all focus:outline-none ${themeBg} ${themeHoverBg}`}
                                >
                                    Save Image <FaArrowRight />
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

            {/* 4. EDIT BRAND MODAL (Mock functional popup) */}
            {showEditModal && editingBrand && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center shrink-0">
                                    <FaEdit className="text-lg" />
                                </div>
                                <h3 className="text-base font-black tracking-tight text-gray-800">Edit Brand Logo</h3>
                            </div>
                            <button 
                                onClick={() => { setShowEditModal(false); setEditingBrand(null); }}
                                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors focus:outline-none"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Form Content */}
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={editingBrand.name}
                                    onChange={(e) => setEditingBrand({...editingBrand, name: e.target.value})}
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                                <select 
                                    value={editingBrand.status}
                                    onChange={(e) => setEditingBrand({...editingBrand, status: e.target.value})}
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Modal Footer Controls */}
                            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => { setShowEditModal(false); setEditingBrand(null); }}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all focus:outline-none ${themeBg} ${themeHoverBg}`}
                                >
                                    Save Changes <FaArrowRight />
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}