"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    FaAd, FaUpload, FaChevronDown, FaChevronRight, FaTimes, 
    FaPlus, FaSync, FaInfoCircle, FaInbox, FaArrowRight, FaImage, 
    FaHome, FaFlask, FaPills, FaUtensils 
} from "react-icons/fa";

export default function BannerManagement() {
    const [activeTab, setActiveTab] = useState("home"); // 'home', 'lab', 'pharmacy', 'food'
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial realistic banner datasets across different categories
    const [banners, setBanners] = useState([
        { id: 1, category: "home", img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop", position: 1 },
        { id: 2, category: "home", img: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop", position: 2 },
        { id: 3, category: "lab", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop", position: 1 },
        { id: 4, category: "lab", img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop", position: 2 },
        { id: 5, category: "lab", img: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&auto=format&fit=crop", position: 3 },
        { id: 6, category: "pharmacy", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop", position: 1 },
        { id: 7, category: "pharmacy", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop", position: 2 },
        { id: 8, category: "food", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop", position: 1 },
        { id: 9, category: "food", img: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&auto=format&fit=crop", position: 2 }
    ]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Theme Color Tokens based on #3D3F96 (Royal Indigo)
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // Filtering active banners based on selected Tab
    const currentBanners = useMemo(() => {
        return banners.filter(b => b.category === activeTab).sort((a, b) => a.position - b.position);
    }, [banners, activeTab]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Simulated handler to upload and place a new banner
    const handleMoveToBoxes = () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setTimeout(() => {
            const newId = banners.length > 0 ? Math.max(...banners.map(b => b.id)) + 1 : 1;
            const newPosition = currentBanners.length > 0 ? Math.max(...currentBanners.map(b => b.position)) + 1 : 1;
            
            // Checking limits (up to 6 banners as per your setup)
            if (newPosition > 6) {
                alert("You can only upload up to 6 banners for this category!");
                setIsUploading(false);
                return;
            }

            const newBanner = {
                id: newId,
                category: activeTab,
                img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop", // Fallback premium placeholder
                position: newPosition
            };

            setBanners([...banners, newBanner]);
            setSelectedFile(null);
            setIsUploading(false);
            const fileInput = document.getElementById("banner-upload");
            if (fileInput) fileInput.value = "";
        }, 1200);
    };

    const handleRemoveBanner = (id) => {
        if (window.confirm("Are you sure you want to remove this banner?")) {
            setBanners(prev => prev.filter(b => b.id !== id));
        }
    };

    // Helper to get descriptive tab name
    const getTabLabel = () => {
        switch (activeTab) {
            case "home": return "Home 2 Banners";
            case "lab": return "Lab 0 Banners";
            case "pharmacy": return "Pharmacy 3 Banners";
            case "food": return "Food 4 Banners";
            default: return "";
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* 1. TOP HEADER SECTION */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                    <FaAd className="text-xl" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Banner Management</h2>
                    <p className="text-xs text-gray-400">Configure, organize, and upload promotional banners across separate categories</p>
                </div>
            </div>

            {/* 2. DYNAMIC TABSWITCHERS (Category Selection) */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-wrap gap-2.5">
                <button
                    onClick={() => setActiveTab("home")}
                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
                        activeTab === "home" ? `${themeBg} text-white shadow-lg ${themeShadow}` : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <FaHome /> Home Banners
                </button>
                <button
                    onClick={() => setActiveTab("lab")}
                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
                        activeTab === "lab" ? `${themeBg} text-white shadow-lg ${themeShadow}` : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <FaFlask /> Lab Banners
                </button>
                <button
                    onClick={() => setActiveTab("pharmacy")}
                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
                        activeTab === "pharmacy" ? `${themeBg} text-white shadow-lg ${themeShadow}` : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <FaPills /> Pharmacy Banners
                </button>
                <button
                    onClick={() => setActiveTab("food")}
                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
                        activeTab === "food" ? `${themeBg} text-white shadow-lg ${themeShadow}` : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <FaUtensils /> Food Banners
                </button>
            </div>

            {/* 3. CORE BANNER MANAGEMENT LAYOUT (2-Column Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Upload Container (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-50">
                            {getTabLabel()}
                        </h3>

                        {/* Image Preview Window */}
                        <div className="flex justify-center bg-gray-50 rounded-2xl border border-gray-100 p-4">
                            <div className="relative w-full h-44 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                {selectedFile ? (
                                    <img 
                                        src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop" 
                                        alt="Upload preview" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-300 gap-1.5">
                                        <FaImage className="text-4xl" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preview Area</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Premium custom uploader block */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Banners</label>
                            <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-5 cursor-pointer transition-colors group">
                                <input 
                                    type="file" 
                                    id="banner-upload"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                                />
                                <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                                <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 text-center px-4 transition-colors truncate max-w-full">
                                    {selectedFile ? selectedFile.name : "Choose Files"}
                                </span>
                                <span className="text-[9px] text-gray-400 mt-1 uppercase font-black tracking-widest">Select up to 6 images</span>
                            </div>
                        </div>

                        {/* Upload Queue Trigger */}
                        <button
                            onClick={handleMoveToBoxes}
                            disabled={!selectedFile || isUploading}
                            className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isUploading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Moving Banners...
                                </>
                            ) : `Move to Boxes (${selectedFile ? 1 : 0})`}
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Existing Banners Grid (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-50">
                            Existing Banners
                        </h3>

                        {currentBanners.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {currentBanners.map((banner) => (
                                    <div 
                                        key={banner.id}
                                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                                    >
                                        {/* Crop view of existing banner */}
                                        <div className="relative w-full h-32 bg-gray-50 overflow-hidden border-b border-gray-100 shrink-0">
                                            <img 
                                                src={banner.img} 
                                                alt={`Position ${banner.position}`} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Banner info & Delete action */}
                                        <div className="p-4 flex flex-col items-center justify-center gap-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Position: <strong className="text-gray-800">{banner.position}</strong>
                                            </span>
                                            <button 
                                                onClick={() => handleRemoveBanner(banner.id)}
                                                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all focus:outline-none"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty Banners Fallback */
                            <div className="flex flex-col items-center justify-center text-center p-12 gap-3">
                                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    <FaInbox className="text-2xl" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700">No Banners Configured</h4>
                                    <p className="text-xs text-slate-400 mt-1">Upload and queue banners on the left to activate this category.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. BOTTOM EMPTY UPLOAD SLOT SLOTS (As shown in your "Banners to Upload" section) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
                <div className="border-b border-gray-50 pb-3">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                        Banners to Upload Slots
                    </h3>
                    <p className="text-xs text-gray-400">Preview placeholders for queued upload slots (maximum 6)</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {/* Filling the array up to 6 total slots with either active banners or empty ones */}
                    {Array.from({ length: 6 }).map((_, i) => {
                        const activeBanner = currentBanners[i];
                        return (
                            <div 
                                key={i}
                                className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
                                    activeBanner 
                                        ? "border-emerald-100 bg-emerald-50/10 shadow-sm" 
                                        : "border-gray-100 bg-gray-50/30"
                                }`}
                            >
                                {activeBanner ? (
                                    <img 
                                        src={activeBanner.img} 
                                        alt="queued" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Empty</span>
                                        <span className="text-[8px] text-gray-300 font-bold block mt-0.5">Slot {i + 1}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}