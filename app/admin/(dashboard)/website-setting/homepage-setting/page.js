"use client";

import { useState } from "react";
import { 
    FaSlidersH, FaUpload, FaInfoCircle, FaArrowRight, FaHome, 
    FaFlask, FaPills, FaUserMd, FaQuestionCircle, FaHandshake, 
    FaCheck, FaImage, FaTimes 
} from "react-icons/fa";

export default function WebsiteSetting() {
    const [activeTab, setActiveTab] = useState("home"); // 'home', 'intro', 'about', 'medicine', 'lab', 'doctors', 'affiliates', 'faq'
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Theme Color Tokens
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // 1. Standalone Mock Datasets for all 8 remaining tabs
    const [formData, setFormData] = useState({
        home: {
            title: "Diabeteswala Website",
            desc: "Here you will order medicines, book tests, consultations and nutrition meals.",
            file: null
        },
        intro: {
            title: "Empowering Your Diabetic Journey",
            desc: "Diabeteswala is an integrated, specialized healthcare platform providing end-to-end diabetes care.",
            file: null
        },
        about: {
            title: "About Diabeteswala",
            desc: "Our mission is to simplify diabetes management by offering a consolidated medical, diagnostic, and nutritional ecosystem.",
            file: null
        },
        medicine: {
            title: "100% Genuine Diabetes Medicines",
            desc: "Browse a wide range of insulin, diabetic tablets, and health consumables delivered instantly to your door.",
            file: null
        },
        lab: {
            title: "Certified Home-Sample Diagnostics",
            desc: "Book complete HbA1c, sugar levels, and lipid profiles with NABL certified lab partners.",
            file: null
        },
        doctors: {
            title: "Meet Our Diabetes Specialists",
            desc: "Consult with leading diabetologists, cardiologists, and endocrinologists online or in-person.",
            file: null
        },
        affiliates: {
            title: "Our Trusted Health Partners",
            desc: "Collaborating with premium medical institutes and pharmaceutical laboratories.",
            file: null
        },
        faq: {
            q1: "How can I book a home sample collection?",
            a1: "Go to the 'Labs' page, select your required test, and choose a convenient time slot for home collection.",
            q2: "Are the medicines sold here genuine?",
            a2: "Yes, we source all medications directly from certified partners and top-tier pharmaceutical manufacturers."
        }
    });

    const handleInputChange = (tab, field, value) => {
        setFormData(prev => ({
            ...prev,
            [tab]: { ...prev[tab], [field]: value }
        }));
    };

    const handleFileChange = (tab, file) => {
        setFormData(prev => ({
            ...prev,
            [tab]: { ...prev[tab], file: file }
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulating API submitting for visual feedback
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
                    <p className="text-xs text-gray-400">Manage and update all customer-facing website pages and banners from here</p>
                </div>
            </div>

            {/* HORIZONTALLY SCROLLABLE PREMIUM TABSWITCHERS (Excluding Nursing, Ambulance, Hospital, Articles) */}
            <div className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                    { key: "home", label: "Home", icon: <FaHome /> },
                    { key: "intro", label: "Introduction", icon: <FaInfoCircle /> },
                    { key: "about", label: "About Us", icon: <FaInfoCircle /> },
                    { key: "medicine", label: "Medicine", icon: <FaPills /> },
                    { key: "lab", label: "Laboratory", icon: <FaFlask /> },
                    { key: "doctors", label: "Doctors Team", icon: <FaUserMd /> },
                    { key: "affiliates", label: "Affiliates", icon: <FaHandshake /> },
                    { key: "faq", label: "FAQ", icon: <FaQuestionCircle /> }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus:outline-none shrink-0 ${
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
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-8">
                
                {/* Form Wrapper */}
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="border-b border-gray-50 pb-3 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                            Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
                        </h3>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Edit Mode</span>
                    </div>

                    {/* FAQ Tab (Custom input structure) */}
                    {activeTab === "faq" ? (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Question 1</label>
                                    <input 
                                        type="text" 
                                        value={formData.faq.q1} 
                                        onChange={(e) => setFormData({...formData, faq: { ...formData.faq, q1: e.target.value }})}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Answer 1</label>
                                    <textarea 
                                        rows="2"
                                        value={formData.faq.a1} 
                                        onChange={(e) => setFormData({...formData, faq: { ...formData.faq, a1: e.target.value }})}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Question 2</label>
                                    <input 
                                        type="text" 
                                        value={formData.faq.q2} 
                                        onChange={(e) => setFormData({...formData, faq: { ...formData.faq, q2: e.target.value }})}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Answer 2</label>
                                    <textarea 
                                        rows="2"
                                        value={formData.faq.a2} 
                                        onChange={(e) => setFormData({...formData, faq: { ...formData.faq, a2: e.target.value }})}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Standard Tabs Input Structure (Home, Intro, About, etc.) */
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title*</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData[activeTab].title}
                                        onChange={(e) => handleInputChange(activeTab, "title", e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description / Subtitle*</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData[activeTab].desc}
                                        onChange={(e) => handleInputChange(activeTab, "desc", e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Premium Dotted Image Uploader */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upload Showcase Image</label>
                                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-6 cursor-pointer transition-colors group">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(activeTab, e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    />
                                    <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {formData[activeTab].file ? formData[activeTab].file.name : "Choose Files or Drag & Drop here"}
                                    </span>
                                    <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Supports PNG, JPG, JPEG</span>
                                </div>
                            </div>

                            {/* Active Showcase Previews */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Active Section Previews</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="h-32 rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group">
                                        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop" className="w-full h-full object-cover" alt="prev1" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><button type="button" className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600"><FaTimes className="text-xs" /></button></div>
                                    </div>
                                    <div className="h-32 rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group">
                                        <img src="https://images.unsplash.com/photo-1551076805-e18690237571?w=300&auto=format&fit=crop" className="w-full h-full object-cover" alt="prev2" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><button type="button" className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600"><FaTimes className="text-xs" /></button></div>
                                    </div>
                                    <div className="h-32 rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group">
                                        <img src="https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=300&auto=format&fit=crop" className="w-full h-full object-cover" alt="prev3" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><button type="button" className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600"><FaTimes className="text-xs" /></button></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       HOME TAB SPECIFIC: ACTIVE HOME BANNERS PREVIEW
                       ========================================== */}
                    {activeTab === "home" && (
                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <FaImage className={themeText} />
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Homepage Banners Preview</h4>
                            </div>
                            
                            {/* Horizontal grid/carousel representing live banners */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col justify-between group">
                                    <div className="h-28 overflow-hidden bg-gray-50">
                                        <img src="https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt="banner1" />
                                    </div>
                                    <div className="p-3 bg-gray-50/50 flex justify-between items-center text-xs">
                                        <span className="font-bold text-gray-600">Position 1: Rapid Delivery</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Active</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col justify-between group">
                                    <div className="h-28 overflow-hidden bg-gray-50">
                                        <img src="https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt="banner2" />
                                    </div>
                                    <div className="p-3 bg-gray-50/50 flex justify-between items-center text-xs">
                                        <span className="font-bold text-gray-600">Position 2: Medical Advice</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Active</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col justify-between group">
                                    <div className="h-28 overflow-hidden bg-gray-50">
                                        <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt="banner3" />
                                    </div>
                                    <div className="p-3 bg-gray-50/50 flex justify-between items-center text-xs">
                                        <span className="font-bold text-gray-600">Position 3: Skincare Care</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Active</span>
                                    </div>
                                </div>
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