"use client";

import { useState, useEffect } from "react";
import { 
    FaSlidersH, FaUpload, FaInfoCircle, FaArrowRight, 
    FaFlask, FaCheckCircle, FaTrash, FaPlus, FaTimes, 
    FaSearch, FaClipboardList, FaInfo, FaShieldAlt, FaVial 
} from "react-icons/fa";

export default function LabPageSetting() {
    const [activeTab, setActiveTab] = useState("searchTest"); // 'searchTest', 'bookLab', 'howItWorks', 'labCare', 'about', 'verify'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Theme Color Tokens
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // 1. Standalone Mock States for all 6 Tabs (No API dependency)
    
    // Tab 1: Search Test Page State
    const [searchTest, setSearchTest] = useState({
        tagline: "100% Verified Labs",
        searchLabel: "Find your diagnostics..",
        heading: "Search Test By Habits!",
        desc: "Find your diagnostics from our verified partners..."
    });

    // Tab 2: Book Lab State (with interactive featured tests list)
    const [bookLabTitle, setBookLabTitle] = useState("Book Diagnostic Tests Online");
    const [bookLabDesc, setBookLabDesc] = useState("Schedule blood tests, urine tests, and specialized profiles with ease.");
    const [featuredTests, setFeaturedTests] = useState([
        "HbA1c Test",
        "Lipid Profile",
        "Complete Blood Count (CBC)",
        "Fasting Blood Sugar"
    ]);

    // Tab 3: How It Works State (with interactive steps list)
    const [worksTitle, setWorksTitle] = useState("Simple 3-Step Lab Diagnostics");
    const [worksDesc, setWorksDesc] = useState("How our verified NABL partner labs handle your diagnostic requests.");
    const [stepsList, setStepsList] = useState([
        "Select Test & Schedule",
        "Certified Phlebotomist Arrives",
        "Digital Reports in 24 Hours"
    ]);

    // Tab 4: Lab Care State (with interactive care points list)
    const [labCareTitle, setLabCareTitle] = useState("Specialized Lab Care Program");
    const [labCareDesc, setLabCareDesc] = useState("We enforce world-class medical guidelines and sanitization protocols.");
    const [carePoints, setLabCarePoints] = useState([
        "WHO Standard Sanitized Kits",
        "NABL Accredited Partners"
    ]);

    // Tab 5: About Us State
    const [aboutData, setAboutData] = useState({
        title: "About Our Diagnostic Network",
        desc: "Diabeteswala collaborates with leading diagnostic centers to bring clinical precision right to your doorstep.",
        badge: "ISO 9001:2015 & NABL Compliant"
    });

    // Tab 6: Research & Verify State (with interactive cards grid)
    const [verifyTitle, setVerifyTitle] = useState("Verified Diagnostic Quality");
    const [verifyDesc, setVerifyDesc] = useState("Every partner laboratory undergoes a rigorous quality auditing process.");
    const [verifyCards, setVerifyCards] = useState([
        { id: 1, title: "Verified Equipment", desc: "Latest medical testing devices" },
        { id: 2, title: "Licensed Pathologists", desc: "Certified clinical experts" }
    ]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Handlers for Tab 2 (Featured Tests)
    const handleAddTest = () => {
        setFeaturedTests([...featuredTests, "New Diagnostic Test"]);
    };
    const handleTestChange = (index, value) => {
        const updated = [...featuredTests];
        updated[index] = value;
        setFeaturedTests(updated);
    };
    const handleRemoveTest = (index) => {
        setFeaturedTests(featuredTests.filter((_, i) => i !== index));
    };

    // Handlers for Tab 3 (How It Works Steps)
    const handleAddStep = () => {
        setStepsList([...stepsList, "New Procedure Step"]);
    };
    const handleStepChange = (index, value) => {
        const updated = [...stepsList];
        updated[index] = value;
        setStepsList(updated);
    };
    const handleRemoveStep = (index) => {
        setStepsList(stepsList.filter((_, i) => i !== index));
    };

    // Handlers for Tab 4 (Lab Care Points)
    const handleAddCarePoint = () => {
        setLabCarePoints([...carePoints, "New Care Guideline"]);
    };
    const handleCarePointChange = (index, value) => {
        const updated = [...carePoints];
        updated[index] = value;
        setLabCarePoints(updated);
    };
    const handleRemoveCarePoint = (index) => {
        setLabCarePoints(carePoints.filter((_, i) => i !== index));
    };

    // Handlers for Tab 6 (Verify Cards)
    const handleAddVerifyCard = () => {
        const newId = verifyCards.length > 0 ? Math.max(...verifyCards.map(c => c.id)) + 1 : 1;
        setVerifyCards([...verifyCards, { id: newId, title: "New Quality Standard", desc: "Audit Parameter description" }]);
    };
    const handleVerifyCardChange = (id, field, value) => {
        setVerifyCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };
    const handleRemoveVerifyCard = (id) => {
        setVerifyCards(verifyCards.filter(c => c.id !== id));
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
                    <p className="text-xs text-gray-400">Manage and update all website sections from here</p>
                </div>
            </div>

            {/* HORIZONTALLY SCROLLABLE PREMIUM TABSWITCHERS */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                    { key: "searchTest", label: "Search Test" },
                    { key: "bookLab", label: "Book Lab" },
                    { key: "howItWorks", label: "How It Works" },
                    { key: "labCare", label: "Lab Care" },
                    { key: "about", label: "About Us" },
                    { key: "verify", label: "Research & Verify" }
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
                       TAB 1: SEARCH TEST FORM (Manage Search Test Page)
                       ========================================== */}
                    {activeTab === "searchTest" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Search Test Page
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mini Title (Verification Tag)</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={searchTest.tagline}
                                        onChange={(e) => setSearchTest({ ...searchTest, tagline: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search Input Label</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={searchTest.searchLabel}
                                        onChange={(e) => setSearchTest({ ...searchTest, searchLabel: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Main Heading</label>
                                <input 
                                    type="text" 
                                    required
                                    value={searchTest.heading}
                                    onChange={(e) => setSearchTest({ ...searchTest, heading: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description Text</label>
                                <textarea 
                                    rows="3"
                                    required
                                    value={searchTest.desc}
                                    onChange={(e) => setSearchTest({ ...searchTest, desc: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                />
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 2: BOOK LAB FORM (With interactive featured tests list)
                       ========================================== */}
                    {activeTab === "bookLab" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Book Lab Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={bookLabTitle}
                                        onChange={(e) => setBookLabTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={bookLabDesc}
                                        onChange={(e) => setBookLabDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Featured Tests List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Featured Diagnostic Tests</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddTest}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Test
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {featuredTests.map((test, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                                                <FaVial className="text-sm" />
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                value={test}
                                                onChange={(e) => handleTestChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveTest(index)}
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
                       TAB 3: HOW IT WORKS FORM (With interactive steps list)
                       ========================================== */}
                    {activeTab === "howItWorks" && (
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
                                        value={worksTitle}
                                        onChange={(e) => setWorksTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Subtitle</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={worksDesc}
                                        onChange={(e) => setWorksDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Steps List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Execution Steps</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddStep}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Step
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {stepsList.map((step, index) => (
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
                       TAB 4: LAB CARE FORM (With interactive care points list)
                       ========================================== */}
                    {activeTab === "labCare" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Lab Care Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={labCareTitle}
                                        onChange={(e) => setLabCareTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={labCareDesc}
                                        onChange={(e) => setLabCareDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Interactive Care Guidelines List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lab Care Guidelines</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddCarePoint}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Guideline
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {carePoints.map((point, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                                <FaCheckCircle className="text-sm" />
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                value={point}
                                                onChange={(e) => handleCarePointChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveCarePoint(index)}
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
                       TAB 5: ABOUT US FORM
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

                    {/* ==========================================
                       TAB 6: RESEARCH & VERIFY FORM (With interactive cards grid)
                       ========================================== */}
                    {activeTab === "verify" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Research &amp; Verify Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={verifyTitle}
                                        onChange={(e) => setVerifyTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={verifyDesc}
                                        onChange={(e) => setVerifyDesc(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Dynamic Content Cards Grid */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verification Checklist Cards</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddVerifyCard}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Card
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {verifyCards.map((card) => (
                                        <div 
                                            key={card.id} 
                                            className="relative bg-white border border-l-4 border-l-[#3D3F96] border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-3"
                                        >
                                            {/* Delete card button */}
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveVerifyCard(card.id)}
                                                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 focus:outline-none transition-colors"
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Card Title</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={card.title}
                                                    onChange={(e) => handleVerifyCardChange(card.id, "title", e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                                <textarea 
                                                    rows="2"
                                                    required
                                                    value={card.desc}
                                                    onChange={(e) => handleVerifyCardChange(card.id, "desc", e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                                />
                                            </div>
                                        </div>
                                    ))}
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
                                    Save Page Content <FaArrowRight />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}