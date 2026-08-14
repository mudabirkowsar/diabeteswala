"use client";

import { useState } from "react";
import { 
    FaUtensils, FaUpload, FaInfoCircle, FaArrowRight, 
    FaPizzaSlice, FaPlusCircle, FaHeartbeat, FaRegFolderOpen 
} from "react-icons/fa";

export default function CategoryFood() {
    const [activeTab, setActiveTab] = useState("category"); // 'category' or 'meal'
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Food Category Form States
    const [foodType, setFoodType] = useState("");
    const [subCategoryName, setSubCategoryName] = useState("");
    const [calories, setCalories] = useState("");
    const [categoryFile, setCategoryFile] = useState(null);

    // Meal Type Form States
    const [mealName, setMealName] = useState("");
    const [mealFile, setMealFile] = useState(null);

    // Theme Color Tokens
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // Handle File Selections
    const handleCategoryFileChange = (e) => {
        if (e.target.files[0]) {
            setCategoryFile(e.target.files[0]);
        }
    };

    const handleMealFileChange = (e) => {
        if (e.target.files[0]) {
            setMealFile(e.target.files[0]);
        }
    };

    // Simulated submit handlers with dynamic loader animations
    const handleCategorySubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            alert(`Food Category "${subCategoryName}" under "${foodType}" created successfully! (Mock Mode)`);
            setFoodType("");
            setSubCategoryName("");
            setCalories("");
            setCategoryFile(null);
        }, 1200);
    };

    const handleMealSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            alert(`New Meal Type "${mealName}" added successfully! (Mock Mode)`);
            setMealName("");
            setMealFile(null);
        }, 1200);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 select-none animate-fadeIn">
            
            {/* PAGE TITLE */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                    <FaUtensils className="text-lg" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Food Category &amp; Meal Management</h2>
                    <p className="text-xs text-gray-400">Configure food categories, meal types, and calorie parameters</p>
                </div>
            </div>

            {/* PREMIUM TAB SWITCHER */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex gap-2 shrink-0">
                <button
                    onClick={() => { setActiveTab("category"); handleResetFilters(); }}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${
                        activeTab === "category" 
                            ? `${themeBg} text-white shadow-lg ${themeShadow}` 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <FaPizzaSlice className="text-xs" />
                    Add Food Category
                </button>
                <button
                    onClick={() => { setActiveTab("meal"); handleResetFilters(); }}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${
                        activeTab === "meal" 
                            ? `${themeBg} text-white shadow-lg ${themeShadow}` 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <FaRegFolderOpen className="text-xs" />
                    Add Meal Type
                </button>
            </div>

            {/* ==========================================
               TAB 1: ADD FOOD CATEGORY FORM
               ========================================== */}
            {activeTab === "category" && (
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                    
                    {/* Information Banner */}
                    <div className="bg-sky-50/60 rounded-xl p-4 border border-sky-100 flex items-start gap-3">
                        <FaInfoCircle className="text-sky-600 text-sm mt-0.5 shrink-0" />
                        <p className="text-xs text-sky-700 leading-relaxed font-semibold">
                            Use this form to add a specific food item (e.g., &quot;Margherita&quot;) under a broader food type (e.g., &quot;Pizza&quot;).
                        </p>
                    </div>

                    <form onSubmit={handleCategorySubmit} className="space-y-6">
                        {/* Food Type Selector */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Food Type*</label>
                            <select
                                required
                                value={foodType}
                                onChange={(e) => setFoodType(e.target.value)}
                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                            >
                                <option value="">Select a Type or Add New...</option>
                                <option value="Pizza">Pizza</option>
                                <option value="Burger">Burger</option>
                                <option value="Salad">Salad</option>
                                <option value="Soup">Soup</option>
                            </select>
                        </div>

                        {/* Sub-Category Name & Calories Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sub-Category Name*</label>
                                <input
                                    type="text"
                                    required
                                    value={subCategoryName}
                                    onChange={(e) => setSubCategoryName(e.target.value)}
                                    placeholder="e.g., Veggie Delight"
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaHeartbeat className={themeText} /> Calories (Optional)</label>
                                <input
                                    type="text"
                                    value={calories}
                                    onChange={(e) => setCalories(e.target.value)}
                                    placeholder="e.g., 350 kcal"
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                />
                            </div>
                        </div>

                        {/* Premium Dotted File Uploader */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category Images*</label>
                            <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-6 cursor-pointer transition-colors group">
                                <input 
                                    type="file" 
                                    required={!categoryFile}
                                    onChange={handleCategoryFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                />
                                <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                                <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                                    {categoryFile ? categoryFile.name : "Choose File or Drag & Drop here"}
                                </span>
                                <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Supports PNG, JPG, JPEG</span>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Create Category <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ==========================================
               TAB 2: ADD MEAL TYPE FORM
               ========================================== */}
            {activeTab === "meal" && (
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                    
                    {/* Information Banner */}
                    <div className="bg-sky-50/60 rounded-xl p-4 border border-sky-100 flex items-start gap-3">
                        <FaInfoCircle className="text-sky-600 text-sm mt-0.5 shrink-0" />
                        <p className="text-xs text-sky-700 leading-relaxed font-semibold">
                            Use this form to create a new meal type (e.g., &quot;Breakfast&quot;, &quot;Lunch&quot;). You can then assign food items to this meal.
                        </p>
                    </div>

                    <form onSubmit={handleMealSubmit} className="space-y-6">
                        {/* Meal Name Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Meal Name*</label>
                            <input
                                type="text"
                                required
                                value={mealName}
                                onChange={(e) => setMealName(e.target.value)}
                                placeholder="e.g., Breakfast"
                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                            />
                        </div>

                        {/* Premium Dotted File Uploader */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Meal Image*</label>
                            <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-6 cursor-pointer transition-colors group">
                                <input 
                                    type="file" 
                                    required={!mealFile}
                                    onChange={handleMealFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                />
                                <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                                <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                                    {mealFile ? mealFile.name : "Choose File or Drag & Drop here"}
                                </span>
                                <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Supports PNG, JPG, JPEG</span>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        Add Meal <FaPlusCircle />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}