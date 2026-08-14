"use client";

import { useState, useEffect } from "react";
import { 
    FaHeartbeat, FaUpload, FaInfoCircle, FaArrowRight, 
    FaPlus, FaTrash, FaTimes, FaPlusCircle, FaRegClock, 
    FaUserMd, FaCrown, FaCheckCircle, FaBookOpen, FaPalette 
} from "react-icons/fa";

export default function CareProgramSetting() {
    const [activeTab, setActiveTab] = useState("info"); // 'info', 'plans', 'faqs'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Theme Color Tokens based on #3D3F96 (Royal Indigo)
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // 1. Standalone Mock States for all 3 Tabs (Bypassed API)
    
    // Tab 1: Hero & Info Section State
    const [heroData, setHeroData] = useState({
        tagline: "Continuous Glucose Monitoring & Clinical Care",
        title: "Reverse Your Diabetes with Certified Experts",
        desc: "Join our clinically verified programs led by top diabetologists and nutritionists to reclaim your active lifestyle.",
        file: null
    });
    const [infoPoints, setInfoPoints] = useState([
        "Unlimited Online Doctor Consultations",
        "Includes Free Continuous Glucose Monitor (CGM) Sensors",
        "Personalized Diabetic Nutrition Diet Charts"
    ]);

    // Tab 2: Subscription Plans Cards State (Plan Cards Config)
    const [plansTitle, setPlansTitle] = useState("Our Specialized Care Plans");
    const [plansDesc, setPlansDesc] = useState("Choose a plan that fits your clinical requirements and health goals.");
    const [plansList, setPlansList] = useState([
        { id: 1, name: "Starter Care Plan", price: 999, duration: "1 Month", theme: "Indigo", benefits: "1 Doctor Consult, Basic Diet Guide" },
        { id: 2, name: "Active Reversal Plan", price: 2499, duration: "3 Months", theme: "Green", benefits: "Unlimited Consults, Free CGM Sensor, Daily Diet Tracking" },
        { id: 3, name: "Advanced Clinical Plan", price: 4999, duration: "6 Months", theme: "Amber", benefits: "Diabetologist Team, 2 CGM Sensors, Custom Fitness Training" }
    ]);

    // Tab 3: Program FAQs / Guidelines State
    const [faqsTitle, setFaqsTitle] = useState("Frequently Asked Questions");
    const [faqsDesc, setFaqsDesc] = useState("Find answers to common questions about our clinical diabetes reversal program.");
    const [faqsList, setFaqsList] = useState([
        { id: 1, q: "Is diabetic reversal possible?", a: "Yes, early-stage type 2 diabetes can be reversed through strict medical weight management and low-GI nutritional therapies under clinical supervision." },
        { id: 2, q: "Do I get a free CGM sensor?", a: "Yes, the Free Continuous Glucose Monitor (CGM) sensor is included in our Active Reversal and Advanced Clinical plans." }
    ]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Handlers for Tab 1 (Info Points)
    const handleAddInfoPoint = () => {
        setInfoPoints([...infoPoints, "New Informational Point"]);
    };
    const handleInfoPointChange = (index, value) => {
        const updated = [...infoPoints];
        updated[index] = value;
        setInfoPoints(updated);
    };
    const handleRemoveInfoPoint = (index) => {
        setInfoPoints(infoPoints.filter((_, i) => i !== index));
    };

    // Handlers for Tab 2 (Subscription Plans)
    const handleAddPlan = () => {
        const newId = plansList.length > 0 ? Math.max(...plansList.map(p => p.id)) + 1 : 1;
        setPlansList([...plansList, { id: newId, name: "New Care Plan", price: 1499, duration: "3 Months", theme: "Indigo", benefits: "Consultations & basic support" }]);
    };
    const handlePlanChange = (id, field, value) => {
        setPlansList(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };
    const handleRemovePlan = (id) => {
        setPlansList(plansList.filter(p => p.id !== id));
    };

    // Handlers for Tab 3 (Faqs list)
    const handleAddFaq = () => {
        const newId = faqsList.length > 0 ? Math.max(...faqsList.map(f => f.id)) + 1 : 1;
        setFaqsList([...faqsList, { id: newId, q: "New Question?", a: "Answer text here." }]);
    };
    const handleFaqChange = (id, field, value) => {
        setFaqsList(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    };
    const handleRemoveFaq = (id) => {
        setFaqsList(faqsList.filter(f => f.id !== id));
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
                    <FaHeartbeat className="text-xl" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Care Program Setting</h2>
                    <p className="text-xs text-gray-400">Configure, organize, and manage UI details of the user-facing clinical care plans page</p>
                </div>
            </div>

            {/* HORIZONTALLY SCROLLABLE PREMIUM TABSWITCHERS */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                    { key: "info", label: "Hero & Info Section", icon: <FaInfoCircle /> },
                    { key: "plans", label: "Care Plans / Cards", icon: <FaCrown /> },
                    { key: "faqs", label: "Program FAQs", icon: <FaBookOpen /> }
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
                       TAB 1: HERO & INFO SECTION FORM
                       ========================================== */}
                    {activeTab === "info" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Hero &amp; Info Section
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
                            </div>

                            {/* Informational Points List */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Why Join Section Points</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddInfoPoint}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Point
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {infoPoints.map((point, index) => (
                                        <div key={index} className="flex gap-2">
                                            <span className="flex items-center justify-center bg-gray-100 text-gray-500 font-bold w-12 rounded-xl text-xs shrink-0 border border-gray-200">
                                                {index + 1}
                                            </span>
                                            <input 
                                                type="text" 
                                                required
                                                value={point}
                                                onChange={(e) => handleInfoPointChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveInfoPoint(index)}
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
                       TAB 2: CARE PLANS CARDS CONFIG FORM (Plan Cards Management)
                       ========================================== */}
                    {activeTab === "plans" && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                    Manage Subscription Plan Cards
                                </h3>
                                <button 
                                    type="button" 
                                    onClick={handleAddPlan}
                                    className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                >
                                    <FaPlus className="text-[10px]" /> Add New Plan Card
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={plansTitle}
                                        onChange={(e) => setPlansTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={plansDesc}
                                        onChange={(e) => setPlansDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Plan Cards Configuration Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                                {plansList.map((plan) => (
                                    <div 
                                        key={plan.id}
                                        className={`relative bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-3.5 ${
                                            plan.theme === "Green" ? "border-l-4 border-l-emerald-500" :
                                            plan.theme === "Amber" ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-indigo-500"
                                        }`}
                                    >
                                        {/* Remove Plan card */}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemovePlan(plan.id)}
                                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 focus:outline-none transition-colors"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plan Name</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={plan.name}
                                                onChange={(e) => handlePlanChange(plan.id, "name", e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price (₹/month)</label>
                                                <input 
                                                    type="number" 
                                                    required
                                                    value={plan.price}
                                                    onChange={(e) => handlePlanChange(plan.id, "price", parseInt(e.target.value))}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Validity / Duration</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={plan.duration}
                                                    onChange={(e) => handlePlanChange(plan.id, "duration", e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plan Benefits (Comma-separated)</label>
                                            <textarea 
                                                rows="2"
                                                required
                                                value={plan.benefits}
                                                onChange={(e) => handlePlanChange(plan.id, "benefits", e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] resize-none`}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><FaPalette className="text-[10px]" /> Card Theme</label>
                                            <select 
                                                value={plan.theme}
                                                onChange={(e) => handlePlanChange(plan.id, "theme", e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                            >
                                                <option value="Indigo">Indigo Theme</option>
                                                <option value="Green">Green Theme</option>
                                                <option value="Amber">Amber Theme</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 3: PROGRAM FAQS / GUIDELINES FORM
                       ========================================== */}
                    {activeTab === "faqs" && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                    Manage Care Program FAQs
                                </h3>
                                <button 
                                    type="button" 
                                    onClick={handleAddFaq}
                                    className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                >
                                    <FaPlus className="text-[10px]" /> Add New FAQ
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={faqsTitle}
                                        onChange={(e) => setFaqsTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={faqsDesc}
                                        onChange={(e) => setFaqsDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Dynamic FAQ List */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                {faqsList.map((faq) => (
                                    <div key={faq.id} className="relative bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveFaq(faq.id)}
                                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 focus:outline-none transition-colors"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Question</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={faq.q}
                                                onChange={(e) => handleFaqChange(faq.id, "q", e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Answer</label>
                                            <textarea 
                                                rows="2"
                                                required
                                                value={faq.a}
                                                onChange={(e) => handleFaqChange(faq.id, "a", e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] resize-none`}
                                            />
                                        </div>
                                    </div>
                                ))}
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