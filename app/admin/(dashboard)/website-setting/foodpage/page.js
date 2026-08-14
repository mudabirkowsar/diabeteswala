"use client";

import { useState, useEffect } from "react";
import { 
    FaUtensils, FaUpload, FaInfoCircle, FaArrowRight, 
    FaHeartbeat, FaAppleAlt, FaUserMd, FaCheckCircle, 
    FaPlus, FaTrash, FaTimes, FaPlusCircle, FaRegFolderOpen 
} from "react-icons/fa";

export default function FoodPageSetting() {
    const [activeTab, setActiveTab] = useState("hero"); // 'hero', 'categories', 'standards', 'consulting'
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
        tagline: "Healthy Eating Made Easy",
        title: "Diabetic-Safe Meals & Nutrition Delivered",
        desc: "Discover fresh, dietitian-approved low-glycemic index meals, organic snacks, and personalized high-fiber nutrition menus.",
        file: null
    });

    // Tab 2: Meal Categories State (Tailored diabetic diet plans)
    const [categoriesTitle, setCategoriesTitle] = useState("Nutritional Meal Categories");
    const [categoriesDesc, setCategoriesDesc] = useState("Tailored diabetic diet plans mapped to specific times of the day for strict glucose control.");
    const [mealCategories, setMealCategories] = useState([
        "Diabetes-Friendly Low-GI Breakfast",
        "Low-Carb High-Protein Lunch Box",
        "Heart-Healthy Nutritious Dinner Menu",
        "Sugar-Free Healthy Desserts & Snacks"
    ]);

    // Tab 3: Nutrition Standards State (Clinical & Dietitian guidelines)
    const [standardsTitle, setStandardsTitle] = useState("Dietitian Certified & Calorie Counted");
    const [standardsDesc, setStandardsDesc] = useState("Every meal box is crafted under medical supervision with precise macronutrient tracking.");
    const [nutritionStandards, setNutritionStandards] = useState([
        "Strictly Low Glycemic Index (GI) Ingredients Only",
        "Calculated Carb & Calorie Count Printed on Every Box",
        "Prepared in WHO-Certified Hygienic Partner Kitchens"
    ]);

    // Tab 4: Dietitian Consulting State (Custom consulting booking info)
    const [consultingTitle, setConsultingTitle] = useState("Consult with Our Expert Diabetologists & Dietitians");
    const [consultingDesc, setConsultingDesc] = useState("Get a fully customized clinical diet chart tailored specifically to your active HbA1c levels.");
    const [consultingPerks, setConsultingPerks] = useState([
        "Personalized Weekly Diabetes Meal Calendars",
        "Daily Blood Glucose Tracking & Dietary Adjustments",
        "Direct Chat & Video Consulting with Certified Experts"
    ]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Handlers for Tab 2 (Meal Categories List)
    const handleAddCategory = () => {
        setMealCategories([...mealCategories, "New Nutritional Category"]);
    };
    const handleCategoryChange = (index, value) => {
        const updated = [...mealCategories];
        updated[index] = value;
        setMealCategories(updated);
    };
    const handleRemoveCategory = (index) => {
        setMealCategories(mealCategories.filter((_, i) => i !== index));
    };

    // Handlers for Tab 3 (Nutrition Standards List)
    const handleAddStandard = () => {
        setNutritionStandards([...nutritionStandards, "New Nutrition Standard"]);
    };
    const handleStandardChange = (index, value) => {
        const updated = [...nutritionStandards];
        updated[index] = value;
        setNutritionStandards(updated);
    };
    const handleRemoveStandard = (index) => {
        setNutritionStandards(nutritionStandards.filter((_, i) => i !== index));
    };

    // Handlers for Tab 4 (Dietitian Consulting Perks List)
    const handleAddPerk = () => {
        setConsultingPerks([...consultingPerks, "New Consulting Perk"]);
    };
    const handlePerkChange = (index, value) => {
        const updated = [...consultingPerks];
        updated[index] = value;
        setConsultingPerks(updated);
    };
    const handleRemovePerk = (index) => {
        setConsultingPerks(consultingPerks.filter((_, i) => i !== index));
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
                    <FaUtensils className="text-xl" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Food Page Setting</h2>
                    <p className="text-xs text-gray-400">Configure, organize, and manage UI details of the user-facing food &amp; nutrition landing page</p>
                </div>
            </div>

            {/* HORIZONTALLY SCROLLABLE PREMIUM TABSWITCHERS */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                    { key: "hero", label: "Hero Section", icon: <FaUtensils /> },
                    { key: "categories", label: "Meal Categories", icon: <FaAppleAlt /> },
                    { key: "standards", label: "Nutrition Standards", icon: <FaHeartbeat /> },
                    { key: "consulting", label: "Dietitian Consulting", icon: <FaUserMd /> }
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
                                Manage Food Hero Section
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
                                        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop" className="w-full h-full object-cover" alt="prev_food" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 2: MEAL CATEGORIES FORM (With interactive list categories)
                       ========================================== */}
                    {activeTab === "categories" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Meal Categories Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={categoriesTitle}
                                        onChange={(e) => setCategoriesTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={categoriesDesc}
                                        onChange={(e) => setCategoriesDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Categories List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clinical Meal Categories</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddCategory}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Category
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {mealCategories.map((category, index) => (
                                        <div key={index} className="flex gap-2">
                                            <span className="flex items-center justify-center bg-gray-100 text-gray-500 font-bold w-12 rounded-xl text-xs shrink-0 border border-gray-200">
                                                {index + 1}
                                            </span>
                                            <input 
                                                type="text" 
                                                required
                                                value={category}
                                                onChange={(e) => handleCategoryChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveCategory(index)}
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
                       TAB 3: NUTRITION STANDARDS FORM (With interactive list standards)
                       ========================================== */}
                    {activeTab === "standards" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Nutrition Standards Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={standardsTitle}
                                        onChange={(e) => setStandardsTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={standardsDesc}
                                        onChange={(e) => setStandardsDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Nutrition Standards List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hygienic &amp; Medical Standards</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddStandard}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Standard
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {nutritionStandards.map((standard, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                                <FaHeartbeat className="text-sm" />
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                value={standard}
                                                onChange={(e) => handleStandardChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveStandard(index)}
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
                       TAB 4: DIETITIAN CONSULTING FORM
                       ========================================== */}
                    {activeTab === "consulting" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Dietitian Consulting Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={consultingTitle}
                                        onChange={(e) => setConsultingTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={consultingDesc}
                                        onChange={(e) => setConsultingDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Perks List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dietitian Counseling Perks</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddPerk}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Perk
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {consultingPerks.map((perk, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                                <FaUserMd className="text-sm" />
                                            </div>
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
                                    Save Food Page Content <FaArrowRight />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}