"use client";

import { useState, useEffect } from "react";
import { 
    FaClinicMedical, FaUpload, FaInfoCircle, FaArrowRight, 
    FaPlus, FaTrash, FaTimes, FaPlusCircle, FaRegClock, 
    FaHeartbeat, FaStethoscope, FaNotesMedical, FaCheckCircle, FaInbox ,FaHome
} from "react-icons/fa";

export default function ClinicPageSetting() {
    const [activeTab, setActiveTab] = useState("hero"); // 'hero', 'steps', 'specialties', 'standards'
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
        tagline: "Certified Diabetes & General Clinical Care",
        title: "Find Trusted Partner Clinics Near You",
        desc: "Book easy in-person consultations with leading diabetologists and clinical experts at our specialized partner centers.",
        file: null
    });

    // Tab 2: How It Works State (Step-by-step user guide)
    const [stepsTitle, setStepsTitle] = useState("Easy 3-Step Appointment Booking");
    const [stepsDesc, setStepsDesc] = useState("Schedule your clinical consultation within minutes from your mobile.");
    const [bookingSteps, setBookingSteps] = useState([
        "Locate a Specialized Diabetes Clinic Near You",
        "Choose Your Doctor & Appointment Slot",
        "Get Instant Digital Token & Booking Slip"
    ]);

    // Tab 3: Specialties State (Clinical Specialties list)
    const [specialtiesTitle, setSpecialtiesTitle] = useState("Our Specialized Clinical Focus");
    const [specialtiesDesc, setSpecialtiesDesc] = useState("Comprehensive clinical care tailored specifically to diabetes management and general health.");
    const [specialtiesList, setSpecialtiesList] = useState([
        "Diabetology & Insulin Therapy",
        "Diabetic Foot & Wound Care",
        "Endocrinology & Thyroid Panel",
        "Pediatric Diabetes Support"
    ]);

    // Tab 4: Clinical Standards State (Key features & safety norms)
    const [standardsTitle, setStandardsTitle] = useState("Uncompromised Clinical Standards");
    const [standardsDesc, setStandardsDesc] = useState("We enforce rigorous checks on all registered medical centers to ensure safety.");
    const [standardsList, setStandardsList] = useState([
        "Verified & Licensed Medical Professionals",
        "WHO Sanitization & Hygiene Guidelines",
        "NABL Certified Laboratory Integrations"
    ]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Handlers for Tab 2 (How It Works Steps)
    const handleAddStep = () => {
        setBookingSteps([...bookingSteps, "New Appointment Step"]);
    };

    const handleStepChange = (index, value) => {
        const updated = [...bookingSteps];
        updated[index] = value;
        setBookingSteps(updated);
    };

    const handleRemoveStep = (index) => {
        setBookingSteps(bookingSteps.filter((_, i) => i !== index));
    };

    // Handlers for Tab 3 (Specialties List)
    const handleAddSpecialty = () => {
        setSpecialtiesList([...specialtiesList, "New Medical Specialty"]);
    };

    const handleSpecialtyChange = (index, value) => {
        const updated = [...specialtiesList];
        updated[index] = value;
        setSpecialtiesList(updated);
    };

    const handleRemoveSpecialty = (index) => {
        setSpecialtiesList(specialtiesList.filter((_, i) => i !== index));
    };

    // Handlers for Tab 4 (Clinical Standards List)
    const handleAddStandard = () => {
        setStandardsList([...standardsList, "New Clinical Standard"]);
    };

    const handleStandardChange = (index, value) => {
        const updated = [...standardsList];
        updated[index] = value;
        setStandardsList(updated);
    };

    const handleRemoveStandard = (index) => {
        setStandardsList(standardsList.filter((_, i) => i !== index));
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
                    <FaClinicMedical className="text-xl" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Clinic Page Setting</h2>
                    <p className="text-xs text-gray-400">Configure, organize, and manage UI details of the user-facing clinic landing page</p>
                </div>
            </div>

            {/* HORIZONTALLY SCROLLABLE PREMIUM TABSWITCHERS */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                    { key: "hero", label: "Hero Section", icon: <FaHome /> },
                    { key: "steps", label: "How It Works", icon: <FaRegClock /> },
                    { key: "specialties", label: "Specialties", icon: <FaStethoscope /> },
                    { key: "standards", label: "Clinical Standards", icon: <FaNotesMedical /> }
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
                                Manage Hero Section
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
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upload Showcase Image</label>
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
                                        <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop" className="w-full h-full object-cover" alt="prev1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 2: HOW IT WORKS FORM (With interactive list points)
                       ========================================== */}
                    {activeTab === "steps" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage How It Works Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={stepsTitle}
                                        onChange={(e) => setStepsTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subtitle Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={stepsDesc}
                                        onChange={(e) => setStepsDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Booking Steps List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Booking Steps (User-Facing)</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddStep}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Step
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {bookingSteps.map((step, index) => (
                                        <div key={index} className="flex gap-2">
                                            <span className="flex items-center justify-center bg-gray-100 text-gray-500 font-bold w-12 rounded-xl text-xs shrink-0 border border-gray-200">
                                                {index + 1}
                                            </span>
                                            <input 
                                                type="text" 
                                                required
                                                value={step}
                                                onChange={(e) => handleStepChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveStep(index)}
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
                       TAB 3: CLINICAL SPECIALTIES FORM
                       ========================================== */}
                    {activeTab === "specialties" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Clinical Specialties Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={specialtiesTitle}
                                        onChange={(e) => setSpecialtiesTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={specialtiesDesc}
                                        onChange={(e) => setSpecialtiesDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Specialties List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clinical Focus Specialties</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddSpecialty}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Specialty
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {specialtiesList.map((specialty, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                                <FaHeartbeat className="text-sm" />
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                value={specialty}
                                                onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveSpecialty(index)}
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
                       TAB 4: CLINICAL STANDARDS FORM
                       ========================================== */}
                    {activeTab === "standards" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Clinical Standards Section
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

                            {/* Interactive Clinical Standards List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Safety &amp; Compliance Standards</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddStandard}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Standard
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {standardsList.map((standard, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                                <FaCheckCircle className="text-sm" />
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