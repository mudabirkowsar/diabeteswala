"use client";

import { useState, useEffect } from "react";
import { 
    FaSlidersH, FaUpload, FaInfoCircle, FaArrowRight, 
    FaPills, FaCheckCircle, FaTrash, FaPlus, FaTimes, 
    FaSearch, FaClipboardList, FaCrown, FaImage, FaHeartbeat 
} from "react-icons/fa";

export default function BuyMedicineSetting() {
    const [activeTab, setActiveTab] = useState("mainTop"); // 'mainTop', 'sectionThree', 'bestOfBest', 'recommended', 'about'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Theme Color Tokens
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // 1. Standalone Mock States for all 5 Tabs (No API dependency)
    
    // Tab 1: Main Top Page Content
    const [mainTopData, setMainTopData] = useState({
        title: "Online Pharmacy!",
        desc: "Verified pharmacies and labs. Safe and secure. Fast delivery.",
        card1Title: "Regular Basis?",
        card1Btn: "Book a refill now",
        card2Title: "Have a prescription?",
        card2Btn: "Upload Now",
        card3Title: "No prescription?",
        card3Btn: "Get started",
        expressTag: "Express Service",
        sidebarTitle: "Delivery Open 24/7",
        sidebarDesc: "Verified pharmacies and labs. Safe and secure. Fast delivery.",
        placeholder: "Search Here"
    });

    // Tab 2: Section Three (Promo section)
    const [sectionThree, setSectionThree] = useState({
        heading: "Flat 20% Off on First Medicine Order!",
        subtitle: "Apply code FIRST20 at checkout.",
        file: null
    });

    // Tab 3: Best of Best (with interactive brands list)
    const [bestOfBestTitle, setBestOfBestTitle] = useState("Best of Best Brands");
    const [bestOfBestDesc, setBestOfBestDesc] = useState("Top pharmaceutical manufacturers trusted globally.");
    const [bestBrands, setBestBrands] = useState([
        "Cipla Ltd",
        "Sun Pharmaceutical Industries",
        "Abbott India",
        "Lupin Ltd"
    ]);

    // Tab 4: Recommended Medicines (with interactive categories list)
    const [recTitle, setRecTitle] = useState("Recommended For You");
    const [recDesc, setRecDesc] = useState("Curated medicine categories based on chronic healthcare conditions.");
    const [recCategories, setRecCategories] = useState([
        "Diabetes Care",
        "Endocrine Care",
        "Cardiac Care"
    ]);

    // Tab 5: About Us Medicines
    const [aboutData, setAboutData] = useState({
        title: "Why Buy From Diabeteswala?",
        desc: "We ensure strict quality auditing on all sourced medicines to provide 100% genuine pharmaceutical inventory.",
        badge: "Verified Genuine Meds & NABL Audited Labs"
    });

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Handlers for Tab 3 (Best Brands)
    const handleAddBrand = () => {
        setBestBrands([...bestBrands, "New Brand Name"]);
    };
    const handleBrandChange = (index, value) => {
        const updated = [...bestBrands];
        updated[index] = value;
        setBestBrands(updated);
    };
    const handleRemoveBrand = (index) => {
        setBestBrands(bestBrands.filter((_, i) => i !== index));
    };

    // Handlers for Tab 4 (Recommended Categories)
    const handleAddRec = () => {
        setRecCategories([...recCategories, "New Health Category"]);
    };
    const handleRecChange = (index, value) => {
        const updated = [...recCategories];
        updated[index] = value;
        setRecCategories(updated);
    };
    const handleRemoveRec = (index) => {
        setRecCategories(recCategories.filter((_, i) => i !== index));
    };

    // Global Submit Handler
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            alert(`"${activeTab.toUpperCase()}" section settings updated successfully! (Mock Mode)`);
        }, 1200);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* PAGE TITLE */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                    <FaSlidersH className="text-xl" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Website Content Management</h2>
                    <p className="text-xs text-gray-400">Manage and update all pharmacy page sections from here</p>
                </div>
            </div>

            {/* HORIZONTALLY SCROLLABLE PREMIUM TABSWITCHERS */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                    { key: "mainTop", label: "Main Top Page" },
                    { key: "sectionThree", label: "Section Three" },
                    { key: "bestOfBest", label: "Best of Best" },
                    { key: "recommended", label: "Recommended Medicines" },
                    { key: "about", label: "About Us Medicines" }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus:outline-none shrink-0 ${
                            activeTab === tab.key 
                                ? `${themeBg} text-white shadow-lg ${themeShadow}` 
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT CARD */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    
                    {/* ==========================================
                       TAB 1: MAIN TOP PAGE FORM
                       ========================================== */}
                    {activeTab === "mainTop" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Pharmacy Page Content
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Main Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={mainTopData.title}
                                        onChange={(e) => setMainTopData({ ...mainTopData, title: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={mainTopData.desc}
                                        onChange={(e) => setMainTopData({ ...mainTopData, desc: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Section Cards Config Row (Card 1, 2, 3) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Card 1 (Title / Button)</span>
                                    <input 
                                        type="text" 
                                        value={mainTopData.card1Title}
                                        onChange={(e) => setMainTopData({ ...mainTopData, card1Title: e.target.value })}
                                        className={`bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none w-full focus:border-[#3D3F96]`}
                                    />
                                    <input 
                                        type="text" 
                                        value={mainTopData.card1Btn}
                                        onChange={(e) => setMainTopData({ ...mainTopData, card1Btn: e.target.value })}
                                        className={`bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none w-full focus:border-[#3D3F96]`}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Card 2 (Title / Button)</span>
                                    <input 
                                        type="text" 
                                        value={mainTopData.card2Title}
                                        onChange={(e) => setMainTopData({ ...mainTopData, card2Title: e.target.value })}
                                        className={`bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none w-full focus:border-[#3D3F96]`}
                                    />
                                    <input 
                                        type="text" 
                                        value={mainTopData.card2Btn}
                                        onChange={(e) => setMainTopData({ ...mainTopData, card2Btn: e.target.value })}
                                        className={`bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none w-full focus:border-[#3D3F96]`}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Card 3 (Title / Button)</span>
                                    <input 
                                        type="text" 
                                        value={mainTopData.card3Title}
                                        onChange={(e) => setMainTopData({ ...mainTopData, card3Title: e.target.value })}
                                        className={`bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none w-full focus:border-[#3D3F96]`}
                                    />
                                    <input 
                                        type="text" 
                                        value={mainTopData.card3Btn}
                                        onChange={(e) => setMainTopData({ ...mainTopData, card3Btn: e.target.value })}
                                        className={`bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none w-full focus:border-[#3D3F96]`}
                                    />
                                </div>
                            </div>

                            {/* Express Tag & Sidebar Title Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Express Tag</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={mainTopData.expressTag}
                                        onChange={(e) => setMainTopData({ ...mainTopData, expressTag: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sidebar Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={mainTopData.sidebarTitle}
                                        onChange={(e) => setMainTopData({ ...mainTopData, sidebarTitle: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Sidebar Description */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sidebar Description</label>
                                <textarea 
                                    rows="2"
                                    required
                                    value={mainTopData.sidebarDesc}
                                    onChange={(e) => setMainTopData({ ...mainTopData, sidebarDesc: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                />
                            </div>

                            {/* Search Bar Placeholder */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search Bar Placeholder</label>
                                <input 
                                    type="text" 
                                    required
                                    value={mainTopData.placeholder}
                                    onChange={(e) => setMainTopData({ ...mainTopData, placeholder: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                />
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 2: SECTION THREE FORM (Promo section)
                       ========================================== */}
                    {activeTab === "sectionThree" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Promotional Section Three
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Promo Heading</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={sectionThree.heading}
                                        onChange={(e) => setSectionThree({ ...sectionThree, heading: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Promo Subtitle</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={sectionThree.subtitle}
                                        onChange={(e) => setSectionThree({ ...sectionThree, subtitle: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Dotted Image Uploader */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Promo Banner Image</label>
                                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-6 cursor-pointer transition-colors group">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setSectionThree({ ...sectionThree, file: e.target.files[0] })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    />
                                    <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {sectionThree.file ? sectionThree.file.name : "Choose File or Drag & Drop here"}
                                    </span>
                                    <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Supports PNG, JPG, JPEG</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 3: BEST OF BEST FORM (With interactive brands list)
                       ========================================== */}
                    {activeTab === "bestOfBest" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Best of Best Brands Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={bestOfBestTitle}
                                        onChange={(e) => setBestOfBestTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={bestOfBestDesc}
                                        onChange={(e) => setBestOfBestDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Brands List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Featured Brands</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddBrand}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Brand
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {bestBrands.map((brand, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                                <FaCrown className="text-sm" />
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                value={brand}
                                                onChange={(e) => handleBrandChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveBrand(index)}
                                                className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-100 transition-colors focus:outline-none"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 4: RECOMMENDED MEDICINES FORM (With interactive categories list)
                       ========================================== */}
                    {activeTab === "recommended" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Recommended Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={recTitle}
                                        onChange={(e) => setRecTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={recDesc}
                                        onChange={(e) => setRecDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Categories List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Curated Medicine Categories</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddRec}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Category
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {recCategories.map((category, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                                <FaHeartbeat className="text-sm" />
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                value={category}
                                                onChange={(e) => handleRecChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveRec(index)}
                                                className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-100 transition-colors focus:outline-none"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 5: ABOUT US MEDICINES FORM
                       ========================================== */}
                    {activeTab === "about" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage About Us Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={aboutData.title}
                                        onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accreditation Badge Text</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={aboutData.badge}
                                        onChange={(e) => setAboutData({ ...aboutData, badge: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                <textarea 
                                    rows="3"
                                    required
                                    value={aboutData.desc}
                                    onChange={(e) => setAboutData({ ...aboutData, desc: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Actions */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg disabled:opacity-50`}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Save Pharmacy Page Content <FaArrowRight />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}