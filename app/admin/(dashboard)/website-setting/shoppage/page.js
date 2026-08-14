"use client";

import { useState, useEffect } from "react";
import { 
    FaStore, FaUpload, FaInfoCircle, FaArrowRight, 
    FaPills, FaUtensils, FaBriefcaseMedical, FaCheckCircle, 
    FaPlus, FaTrash, FaTimes, FaPlusCircle, FaRegFolderOpen 
} from "react-icons/fa";

export default function ShopPageSetting() {
    const [activeTab, setActiveTab] = useState("hero"); // 'hero', 'pharmacy', 'food', 'products'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Theme Color Tokens based on #3D3F96 (Royal Indigo)
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // 1. Standalone Mock States for all 4 Tabs (Bypassed API)
    
    // Tab 1: Hero Section State
    const [heroData, setHeroData] = useState({
        tagline: "One-Stop Diabetic Wellness Store",
        title: "Shop Pharmacy, Healthy Food & Wellness Products",
        desc: "Your trusted destination for genuine prescription medicines, specialized low-GI diabetic meals, and verified blood glucose monitors.",
        file: null
    });

    // Tab 2: Pharmacy Shop State (Settings related to licensed medical shops)
    const [pharmacyTitle, setPharmacyTitle] = useState("Licensed Chemist & Pharmacy Stores");
    const [pharmacyDesc, setPharmacyDesc] = useState("Locate nearest certified pharmacies to refill your prescription orders instantly.");
    const [pharmacyPerks, setPharmacyPerks] = useState([
        "100% Genuine Prescription Medicines Only",
        "Express Doorstep Delivery in 24 Hours",
        "NABL Audited Chemist Partners"
    ]);

    // Tab 3: Healthy Food State (Diabetic-safe diet food settings)
    const [foodTitle, setFoodTitle] = useState("Sugar-Free & Diabetic-Safe Healthy Meals");
    const [foodDesc, setFoodDesc] = useState("Curated nutritionist-approved meal plans and low-GI foods tailored for sugar management.");
    const [foodCategories, setFoodCategories] = useState([
        "High-Fiber Low-GI Diabetic Breakfasts",
        "Sugar-Free Healthy Desserts & Snacks",
        "Natural Organic Green Teas & Juices"
    ]);

    // Tab 4: Wellness Products State (Medical equipment and consumables)
    const [productsTitle, setProductsTitle] = useState("Essential Glucometers & Testing Strips");
    const [productsDesc, setProductsDesc] = useState("Ensure clinical precision with certified testing equipment and diagnostics accessories.");
    const [featuredProducts, setFeaturedProducts] = useState([
        "Blood Glucose Monitors (Glucometers)",
        "Accu-Chek & OneTouch Active Test Strips",
        "Insulin Pen Needles & Sterile Lancets"
    ]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Handlers for Tab 2 (Pharmacy Perks List)
    const handleAddPerk = () => {
        setPharmacyPerks([...pharmacyPerks, "New Pharmacy Perk"]);
    };
    const handlePerkChange = (index, value) => {
        const updated = [...pharmacyPerks];
        updated[index] = value;
        setPharmacyPerks(updated);
    };
    const handleRemovePerk = (index) => {
        setPharmacyPerks(pharmacyPerks.filter((_, i) => i !== index));
    };

    // Handlers for Tab 3 (Food Categories List)
    const handleAddFoodCategory = () => {
        setFoodCategories([...foodCategories, "New Healthy Food Category"]);
    };
    const handleFoodCategoryChange = (index, value) => {
        const updated = [...foodCategories];
        updated[index] = value;
        setFoodCategories(updated);
    };
    const handleRemoveFoodCategory = (index) => {
        setFoodCategories(foodCategories.filter((_, i) => i !== index));
    };

    // Handlers for Tab 4 (Featured Products List)
    const handleAddProduct = () => {
        setFeaturedProducts([...featuredProducts, "New Wellness Product Category"]);
    };
    const handleProductChange = (index, value) => {
        const updated = [...featuredProducts];
        updated[index] = value;
        setFeaturedProducts(updated);
    };
    const handleRemoveProduct = (index) => {
        setFeaturedProducts(featuredProducts.filter((_, i) => i !== index));
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
                    <FaStore className="text-xl" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Shop Page Setting</h2>
                    <p className="text-xs text-gray-400">Configure, organize, and manage UI details of the user-facing e-commerce shop page</p>
                </div>
            </div>

            {/* HORIZONTALLY SCROLLABLE PREMIUM TABSWITCHERS */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                    { key: "hero", label: "Hero Section", icon: <FaStore /> },
                    { key: "pharmacy", label: "Pharmacy Shop", icon: <FaPills /> },
                    { key: "food", label: "Healthy Food", icon: <FaUtensils /> },
                    { key: "products", label: "Wellness Products", icon: <FaBriefcaseMedical /> }
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
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT CARD */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    
                    {/* ==========================================
                       TAB 1: HERO SECTION FORM
                       ========================================== */}
                    {activeTab === "hero" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Shop Hero Section
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Small Accent Tagline</label>
                                <input 
                                    type="text" 
                                    required
                                    value={heroData.tagline}
                                    onChange={(e) => setHeroData({ ...heroData, tagline: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Main Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={heroData.title}
                                        onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description Subtitle</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={heroData.desc}
                                        onChange={(e) => setHeroData({ ...heroData, desc: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Dotted File Uploader */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upload Main Showcase Image</label>
                                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-6 cursor-pointer transition-colors group">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setHeroData({ ...heroData, file: e.target.files[0] })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    />
                                    <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {heroData.file ? heroData.file.name : "Choose File or Drag & Drop here"}
                                    </span>
                                    <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Supports PNG, JPG, JPEG</span>
                                </div>
                                
                                {/* Image Preview */}
                                <div className="mt-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Showcase Image Preview</label>
                                    <div className="h-44 rounded-xl overflow-hidden border border-gray-100 shadow-sm max-w-lg">
                                        <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop" className="w-full h-full object-cover" alt="prev1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 2: PHARMACY SHOP FORM (With interactive list perks)
                       ========================================== */}
                    {activeTab === "pharmacy" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Pharmacy Shop Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={pharmacyTitle}
                                        onChange={(e) => setPharmacyTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={pharmacyDesc}
                                        onChange={(e) => setPharmacyDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Perks List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chemist Partner Perks (User-Facing)</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddPerk}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Perk
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {pharmacyPerks.map((perk, index) => (
                                        <div key={index} className="flex gap-2">
                                            <span className="flex items-center justify-center bg-gray-100 text-gray-500 font-bold w-12 rounded-xl text-xs shrink-0 border border-gray-200">
                                                {index + 1}
                                            </span>
                                            <input 
                                                type="text" 
                                                required
                                                value={perk}
                                                onChange={(e) => handlePerkChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemovePerk(index)}
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
                       TAB 3: HEALTHY FOOD FORM
                       ========================================== */}
                    {activeTab === "food" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Healthy Food Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={foodTitle}
                                        onChange={(e) => setFoodTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={foodDesc}
                                        onChange={(e) => setFoodDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Food Categories List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Promoted Food Categories</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddFoodCategory}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Category
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {foodCategories.map((category, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                                <FaUtensils className="text-sm" />
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                value={category}
                                                onChange={(e) => handleFoodCategoryChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveFoodCategory(index)}
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
                       TAB 4: WELLNESS PRODUCTS FORM
                       ========================================== */}
                    {activeTab === "products" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Wellness Products Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={productsTitle}
                                        onChange={(e) => setProductsTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={productsDesc}
                                        onChange={(e) => setProductsDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Products List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Featured Medical Products</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddProduct}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Product
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {featuredProducts.map((product, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                                <FaBriefcaseMedical className="text-sm" />
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                value={product}
                                                onChange={(e) => handleProductChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveProduct(index)}
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

                    {/* Submit Actions Button */}
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
                                    Save {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section <FaArrowRight />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}