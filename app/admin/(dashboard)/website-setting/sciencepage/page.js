"use client";

import React, { useState, useEffect } from 'react';
import { 
    FaFlask, FaPlus, FaTrash, FaTimes, FaUpload, 
    FaArrowRight, FaSlidersH, FaInfoCircle, FaCheckCircle, 
    FaExclamationTriangle, FaUsers, FaChartLine, FaWallet, FaGlobe 
} from "react-icons/fa";

// Standalone local fallback image component
const ImageWithFallback = ({ src, alt, className, style, fallbackText = "Image not available" }) => {
    const [imgError, setImgError] = useState(false);

    if (imgError || !src) {
        return (
            <div 
                className={`bg-gray-100 flex items-center justify-center text-gray-400 rounded-xl ${className}`}
                style={{...style, minHeight: '80px'}}
            >
                <span className="text-[10px] font-bold uppercase tracking-widest">{fallbackText}</span>
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={alt}
            className={className}
            style={style}
            onError={() => setImgError(true)}
        />
    );
};

// Realistic mock initial state for pure-design mode
const initialSciencePageMock = {
    heroTitle: "Clinical Science & Diabetes Research",
    heroSubtitle: "Explore our peer-reviewed clinical studies, specialized research methodologies, and continuous glucose monitoring statistics.",
    heroBackgroundImage: "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=500&auto=format&fit=crop",
    impactTitle: "Our Clinical & Social Impact",
    grantTitle: "Research Grant Achievements",
    grantSubtitle: "#DiabeteswalaClinicalResearch2026",
    grantBackgroundImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop",
    researchTitle: "Continuous Glucose Monitoring (CGM) Efficacy",
    researchDescription: "Clinical trials indicate that real-time glucose monitoring reduces HbA1c levels significantly within 90 days of structured care program enrollment.",
    researchImages: [
        "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&auto=format&fit=crop"
    ],
    statsTitle: "Verified Clinical Statistics"
};

const initialImpactCardsMock = [
    { _id: "ic1", image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=200&auto=format&fit=crop", number: "15,000+", description: "Active diabetic patients reached and supported through personalized digital care programs." },
    { _id: "ic2", image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200&auto=format&fit=crop", number: "92%", description: "Success rate in stabilizing HbA1c levels within three months of program guidelines adherence." }
];

const initialTeamCardsMock = [
    { _id: "tm1", name: "Dr. Amit Verma", designation: "Chief Endocrinologist", institution: "All India Institute of Medical Sciences" },
    { _id: "tm2", name: "Dr. Priya Sharma", designation: "Clinical Nutritionist", institution: "Post Graduate Institute of Medical Education" }
];

const initialStatisticsMock = [
    { _id: "st1", percentage: "85%", description: "Patients reported reduction in daily insulin dependence.", source: "Diabeteswala Internal Clinical Audit 2026" },
    { _id: "st2", percentage: "4.2x", description: "Better glycemic stability compared to traditional consulting.", source: "Global Journal of Diabetes Care 2025" }
];

export default function SciencePageEditor() {
    // Form and list states
    const [formData, setFormData] = useState(initialSciencePageMock);
    const [impactCards, setImpactCards] = useState(initialImpactCardsMock);
    const [teamCards, setTeamCards] = useState(initialTeamCardsMock);
    const [statistics, setStatistics] = useState(initialStatisticsMock);
    
    // Status indicators
    const [uploadLoading, setUploadLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [activeSection, setActiveSection] = useState('hero');

    // Theme color tokens matching #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleArrayChange = (arrayType, index, field, value) => {
        const setters = {
            impactCards: setImpactCards,
            teamCards: setTeamCards,
            statistics: setStatistics
        };
        const setter = setters[arrayType];
        if (setter) {
            setter(prev => prev.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            ));
        }
    };

    const handleAddItem = (type) => {
        if (type === 'impactCard') {
            const newCard = { _id: `ic_${Date.now()}`, image: "", number: "New Value", description: "Enter card description..." };
            setImpactCards([...impactCards, newCard]);
            setSuccessMessage("Impact card template added!");
        } else if (type === 'teamCard') {
            const newMember = { _id: `tm_${Date.now()}`, name: "New Name", designation: "Designation", institution: "Institution" };
            setTeamCards([...teamCards, newMember]);
            setSuccessMessage("Team member template added!");
        } else if (type === 'statistic') {
            const newStat = { _id: `st_${Date.now()}`, percentage: "Value", description: "Description", source: "Source" };
            setStatistics([...statistics, newStat]);
            setSuccessMessage("Statistic template added!");
        }
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleRemoveItem = (type, index) => {
        if (type === 'impactCard') {
            setImpactCards(impactCards.filter((_, i) => i !== index));
        } else if (type === 'teamCard') {
            setTeamCards(teamCards.filter((_, i) => i !== index));
        } else if (type === 'statistic') {
            setStatistics(statistics.filter((_, i) => i !== index));
        }
        setSuccessMessage(`${type} template removed.`);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleImageUploadMock = (field, file) => {
        if (!file) return;
        setUploadLoading(true);

        // Simulating upload time for interactive design feedback
        setTimeout(() => {
            setUploadLoading(false);
            setSuccessMessage("Image uploaded successfully (Mock Mode)!");
            if (field === 'researchImages') {
                setFormData(prev => ({
                    ...prev,
                    researchImages: [...prev.researchImages, "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=300&auto=format&fit=crop"]
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [field]: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop"
                }));
            }
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1200);
    };

    const removeImage = (field, index = null) => {
        if (index !== null) {
            setFormData(prev => ({
                ...prev,
                [field]: prev[field].filter((_, i) => i !== index)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        // Simulating database saving delay
        setTimeout(() => {
            setSubmitLoading(false);
            setSuccessMessage("Science page content saved successfully! (Mock Mode)");
            setTimeout(() => setSuccessMessage(''), 4000);
        }, 1200);
    };

    const navigationItems = [
        { id: 'hero', label: 'Hero Section' },
        { id: 'impact', label: 'Impact Cards' },
        { id: 'grant', label: 'Grant Section' },
        { id: 'team', label: 'Team Members' },
        { id: 'research', label: 'Research Section' },
        { id: 'stats', label: 'Statistics' }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* TOP HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                        <FaFlask className="text-xl animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Science Page Editor</h2>
                        <p className="text-xs text-gray-400">Configure, organize, and manage UI details of the clinical science page</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button 
                        type="button" 
                        onClick={() => alert("Data refreshed! (Mock Mode)")}
                        className="px-4.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-all focus:outline-none"
                    >
                        Refresh Data
                    </button>
                    <button 
                        type="submit" 
                        form="science-page-form" 
                        disabled={submitLoading}
                        className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                    >
                        {submitLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Updating...
                            </>
                        ) : "Update Science Page"}
                    </button>
                </div>
            </div>

            {/* ERROR AND SUCCESS ALERTS */}
            {uploadError && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3.5 text-amber-700">
                    <FaExclamationTriangle className="text-base shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold">Upload Issue: {uploadError}</span>
                </div>
            )}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3.5 text-emerald-700">
                    <FaCheckCircle className="text-base shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold">{successMessage}</span>
                </div>
            )}

            {/* TWO COLUMN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: NAVIGATION SIDEBAR */}
                <div className="md:col-span-3 space-y-6">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pb-2 border-b border-gray-50">Page Sections</span>
                        {navigationItems.map(item => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveSection(item.id)}
                                className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus:outline-none shrink-0 ${
                                    activeSection === item.id 
                                        ? `${themeBg} text-white shadow-lg ${themeShadow}` 
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.012)] space-y-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block border-b border-gray-50 pb-2">Content Summary</span>
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div>Impact: <strong className="text-gray-800">{impactCards.length}</strong></div>
                            <div>Team: <strong className="text-gray-800">{teamCards.length}</strong></div>
                            <div>Stats: <strong className="text-gray-800">{statistics.length}</strong></div>
                            <div>Images: <strong className="text-gray-800">{formData.researchImages.length}</strong></div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: CORE FORM AREA */}
                <div className="md:col-span-9">
                    <form id="science-page-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* HERO SECTION */}
                        {activeSection === 'hero' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Hero Section</h3>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hero Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.heroTitle}
                                        onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                        placeholder="Enter hero title"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hero Subtitle</label>
                                    <textarea
                                        rows="3"
                                        required
                                        value={formData.heroSubtitle}
                                        onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                        placeholder="Enter hero subtitle"
                                    />
                                </div>
                            </div>
                        )}

                        {/* IMPACT CARDS */}
                        {activeSection === 'impact' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Impact Cards</h3>
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem('impactCard')}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add Card
                                    </button>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Impact Section Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.impactTitle}
                                        onChange={(e) => handleInputChange('impactTitle', e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                        placeholder="Enter impact section title"
                                    />
                                </div>
                                
                                {impactCards.map((card, index) => (
                                    <div key={card._id || index} className="relative bg-white border border-l-4 border-l-[#3D3F96] border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem('impactCard', index)}
                                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 focus:outline-none transition-colors"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Image URL</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={card.image}
                                                    onChange={(e) => handleArrayChange('impactCards', index, 'image', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                    placeholder="Enter image URL"
                                                />
                                                {card.image && (
                                                    <div className="mt-2 h-16 w-16 overflow-hidden rounded-xl border border-gray-100">
                                                        <ImageWithFallback
                                                            src={card.image}
                                                            alt="Impact card"
                                                            className="w-full h-full object-cover"
                                                            fallbackText="No Image"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Number / Value</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={card.number}
                                                    onChange={(e) => handleArrayChange('impactCards', index, 'number', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                    placeholder="Enter number/value"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                            <textarea
                                                rows="2"
                                                required
                                                value={card.description}
                                                onChange={(e) => handleArrayChange('impactCards', index, 'description', e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] resize-none`}
                                                placeholder="Enter description"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* GRANT SECTION */}
                        {activeSection === 'grant' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Grant Section</h3>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Grant Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.grantTitle}
                                        onChange={(e) => handleInputChange('grantTitle', e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                        placeholder="Enter grant title"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Grant Subtitle / Hashtag</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.grantSubtitle}
                                        onChange={(e) => handleInputChange('grantSubtitle', e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                        placeholder="Enter grant subtitle or hashtag"
                                    />
                                </div>
                            </div>
                        )}

                        {/* TEAM MEMBERS */}
                        {activeSection === 'team' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Team Members</h3>
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem('teamCard')}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add Member
                                    </button>
                                </div>

                                {teamCards.map((member, index) => (
                                    <div key={member._id || index} className="relative bg-white border border-l-4 border-l-[#3D3F96] border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem('teamCard', index)}
                                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 focus:outline-none transition-colors"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={member.name}
                                                    onChange={(e) => handleArrayChange('teamCards', index, 'name', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                    placeholder="Enter team member name"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Designation</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={member.designation}
                                                    onChange={(e) => handleArrayChange('teamCards', index, 'designation', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                    placeholder="Enter designation"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Institution</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={member.institution}
                                                    onChange={(e) => handleArrayChange('teamCards', index, 'institution', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                    placeholder="Enter institution"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* RESEARCH SECTION */}
                        {activeSection === 'research' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Research Section</h3>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Research Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.researchTitle}
                                        onChange={(e) => handleInputChange('researchTitle', e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                        placeholder="Enter research title"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Research Description</label>
                                    <textarea
                                        rows="4"
                                        required
                                        value={formData.researchDescription}
                                        onChange={(e) => handleInputChange('researchDescription', e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                        placeholder="Enter research description"
                                    />
                                </div>

                                {/* Custom Dotted File Uploader */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Research Showcase Images</label>
                                    
                                    {/* Selected previews */}
                                    {formData.researchImages.length > 0 && (
                                        <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-2xl mb-2">
                                            {formData.researchImages.map((image, index) => (
                                                <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
                                                    <ImageWithFallback
                                                        src={image}
                                                        alt={`Research ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        fallbackText="Img"
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeImage('researchImages', index)}
                                                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all focus:outline-none"
                                                    >
                                                        <FaTimes className="text-xs text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Dotted drag and drop simulated uploader */}
                                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-6 cursor-pointer transition-colors group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                const files = e.target.files;
                                                if (files && files.length > 0) {
                                                    handleImageUploadMock('researchImages', files);
                                                }
                                            }}
                                            disabled={uploadLoading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                                            {uploadLoading ? "Uploading to platform..." : "Choose Image Files or Drag & Drop"}
                                        </span>
                                        <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Supports multiple PNG, JPG, JPEG</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STATISTICS */}
                        {activeSection === 'stats' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Statistics</h3>
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem('statistic')}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add Statistic
                                    </button>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Statistics Section Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.statsTitle}
                                        onChange={(e) => handleInputChange('statsTitle', e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                        placeholder="Enter statistics section title"
                                    />
                                </div>
                                
                                {statistics.map((stat, index) => (
                                    <div key={stat._id || index} className="relative bg-white border border-l-4 border-l-[#3D3F96] border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem('statistic', index)}
                                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 focus:outline-none transition-colors"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Percentage / Value</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={stat.percentage}
                                                    onChange={(e) => handleArrayChange('statistics', index, 'percentage', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                    placeholder="e.g. 92% or 4x"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={stat.description}
                                                    onChange={(e) => handleArrayChange('statistics', index, 'description', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                    placeholder="Enter description"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={stat.source}
                                                    onChange={(e) => handleArrayChange('statistics', index, 'source', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                    placeholder="Enter source"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}