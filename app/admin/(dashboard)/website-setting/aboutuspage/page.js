"use client";

import React, { useState, useEffect } from 'react';
import { 
    FaSlidersH, FaInfoCircle, FaCheckCircle, FaTimes, FaUpload, 
    FaPlus, FaTrash, FaArrowRight, FaChartBar, FaEye, 
    FaFileContract, FaHeart, FaShieldAlt, FaPlusCircle, FaHandshake, FaGlobe 
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
const initialAboutUsMock = {
    heroTitle: "About Diabeteswala",
    heroDescription: "Your trusted companion in modern diabetic care, continuous monitoring, and clinical lifestyle reversal.",
    heroImage: "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=500&auto=format&fit=crop",
    mainTitle: "Pioneering Automated Diabetic Management",
    mainDescription: "We are building India's largest integrated wellness suite dedicated exclusively to glycemic control, certified medications, and clinical food fleets.",
    mainImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop",
    leftFeatures: ["Continuous Glucose Monitoring (CGM) Kits", "Unlimited Diabetologist Consultation"],
    rightFeatures: ["Dietitian-Certified Low-GI Food Fleets", "NABL Accredited Diagnostics at Home"],
    additionalContent: "Any additional details or guidelines for Diabeteswala's about us page can be drafted directly in this section.",
    priorityStatement: "We prioritize your health, clinical precision, and long-term diabetes reversal above all else.",
    moreAboutTitle: "How Diabeteswala is Different",
    moreAboutDescription: "Traditional consulting focuses solely on prescribing medicines. We focus on continuous tracking, behavioral changes, and custom food plans.",
    moreAboutImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop",
    moreAboutSideImage: "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=500&auto=format&fit=crop",
    moreAboutSideDescription: "Our care coordinators monitor your real-time blood glucose charts and coordinate directly with doctors.",
    stats: {
        patientReviews: "15,000+ Reviews",
        googleRating: "4.8 Stars"
    },
    cards: [
        { title: "Safe Diagnostics", description: "100% sterile, certified NABL lab collections", image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=300&auto=format&fit=crop" },
        { title: "Diabetic Food", description: "Low GI ingredients with precise calorie count", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&auto=format&fit=crop" }
    ],
    missionVision: [
        { type: "mission", title: "Our Mission", description: "To make everyday diabetes management simple, highly precise, and stress-free." },
        { type: "vision", title: "Our Vision", description: "To lead diabetes reversal across India through advanced clinical science and automated health tracking." }
    ],
    insuranceTitle: "Empaneled Insurance & Cashless Partners",
    insuranceLogos: [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&auto=format&fit=crop"
    ],
    isActive: true
};

export default function AboutUsEditor() {
    const [formData, setFormData] = useState(initialAboutUsMock);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [activeSection, setActiveSection] = useState('hero');

    // Theme color tokens matching #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleArrayChange = (fieldName, index, value) => {
        const newArray = [...(formData[fieldName] || [])];
        newArray[index] = value;
        setFormData(prev => ({
            ...prev,
            [fieldName]: newArray
        }));
    };

    const handleObjectArrayChange = (fieldName, index, field, value) => {
        const newArray = [...(formData[fieldName] || [])];
        newArray[index] = {
            ...newArray[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            [fieldName]: newArray
        }));
    };

    const addArrayItem = (fieldName, defaultValue = '') => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: [...(prev[fieldName] || []), defaultValue]
        }));
        setSuccessMessage(`New item added to ${fieldName}!`);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const addObjectArrayItem = (fieldName, defaultObject = {}) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: [...(prev[fieldName] || []), defaultObject]
        }));
        setSuccessMessage(`New card added to ${fieldName}!`);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const removeArrayItem = (fieldName, index) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: (prev[fieldName] || []).filter((_, i) => i !== index)
        }));
        setSuccessMessage(`Item removed.`);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleImageUploadMock = (e, fieldName, index = null) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadLoading(true);
        setTimeout(() => {
            setUploadLoading(false);
            setSuccessMessage("Image uploaded successfully (Mock Mode)!");
            const mockUrl = "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=500&auto=format&fit=crop";
            
            if (fieldName === 'insuranceLogos' && index !== null) {
                const newLogos = [...(formData.insuranceLogos || [])];
                newLogos[index] = mockUrl;
                setFormData(prev => ({ ...prev, insuranceLogos: newLogos }));
            } else if (fieldName === 'cards' && index !== null) {
                const newCards = [...(formData.cards || [])];
                newCards[index] = { ...newCards[index], image: mockUrl };
                setFormData(prev => ({ ...prev, cards: newCards }));
            } else {
                setFormData(prev => ({ ...prev, [fieldName]: mockUrl }));
            }
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1200);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        // Simulating database saving delay
        setTimeout(() => {
            setSubmitLoading(false);
            setSuccessMessage("About Us page content saved successfully! (Mock Mode)");
            setTimeout(() => setSuccessMessage(''), 4000);
        }, 1200);
    };

    const navigationItems = [
        { id: 'hero', label: 'Hero Section' },
        { id: 'stats', label: 'Statistics' },
        { id: 'main', label: 'Main Content' },
        { id: 'more', label: 'More About Section' },
        { id: 'cards', label: 'Feature Cards' },
        { id: 'mission', label: 'Mission & Vision' },
        { id: 'insurance', label: 'Insurance Section' },
        { id: 'additional', label: 'Additional Content' }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* TOP HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                        <FaSlidersH className="text-xl animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Edit About Us Page</h2>
                        <p className="text-xs text-gray-400">Configure, organize, and manage UI details of the website about us page</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button 
                        type="button" 
                        onClick={() => alert("About Us page preview (Mock Mode)")}
                        className="px-4.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-all focus:outline-none"
                    >
                        View Live Page
                    </button>
                    <button 
                        type="submit" 
                        form="about-page-form" 
                        disabled={submitLoading}
                        className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                    >
                        {submitLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Saving...
                            </>
                        ) : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* SUCCESS ALERTS */}
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
                            <div>Cards: <strong className="text-gray-800">{formData.cards.length}</strong></div>
                            <div>Logos: <strong className="text-gray-800">{formData.insuranceLogos.length}</strong></div>
                            <div>Mission: <strong className="text-gray-800">{formData.missionVision.length}</strong></div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: CORE FORM AREA */}
                <div className="md:col-span-9">
                    <form id="about-page-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* HERO SECTION */}
                        {activeSection === 'hero' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Hero Section</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hero Title</label>
                                        <input
                                            type="text"
                                            name="heroTitle"
                                            required
                                            value={formData.heroTitle}
                                            onChange={handleInputChange}
                                            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            placeholder="Enter hero title"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hero Description</label>
                                        <textarea
                                            rows="3"
                                            name="heroDescription"
                                            required
                                            value={formData.heroDescription}
                                            onChange={handleInputChange}
                                            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                            placeholder="Enter hero description"
                                        />
                                    </div>
                                </div>

                                {/* Hero Image Upload */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hero Background Image</label>
                                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-6 cursor-pointer transition-colors group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUploadMock(e, 'heroImage')}
                                            disabled={uploadLoading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                                            {uploadLoading ? "Uploading to platform..." : "Choose Image File or Drag & Drop"}
                                        </span>
                                        <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Supports PNG, JPG, JPEG</span>
                                    </div>
                                    {formData.heroImage && (
                                        <div className="mt-3">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Image Preview</label>
                                            <div className="h-32 rounded-xl overflow-hidden border border-gray-100 shadow-sm max-w-sm">
                                                <ImageWithFallback src={formData.heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STATISTICS */}
                        {activeSection === 'stats' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Statistics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Reviews</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.stats?.patientReviews}
                                            onChange={(e) => handleNestedChange('stats', 'patientReviews', e.target.value)}
                                            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Google Rating</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.stats?.googleRating}
                                            onChange={(e) => handleNestedChange('stats', 'googleRating', e.target.value)}
                                            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MAIN CONTENT SECTION */}
                        {activeSection === 'main' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Main Content Section</h3>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Main Title</label>
                                    <input
                                        type="text"
                                        name="mainTitle"
                                        required
                                        value={formData.mainTitle}
                                        onChange={handleInputChange}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Main Description</label>
                                    <textarea
                                        rows="3"
                                        name="mainDescription"
                                        required
                                        value={formData.mainDescription}
                                        onChange={handleInputChange}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                    />
                                </div>

                                {/* Main image upload */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Main Showcase Image</label>
                                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-6 cursor-pointer transition-colors group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUploadMock(e, 'mainImage')}
                                            disabled={uploadLoading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                                            {uploadLoading ? "Uploading to platform..." : "Choose Image File or Drag & Drop"}
                                        </span>
                                        <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Supports PNG, JPG, JPEG</span>
                                    </div>
                                    {formData.mainImage && (
                                        <div className="mt-3">
                                            <div className="h-32 rounded-xl overflow-hidden border border-gray-100 shadow-sm max-w-sm">
                                                <ImageWithFallback src={formData.mainImage} alt="Main Preview" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Features Lists */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Left Features</label>
                                            <button 
                                                type="button" 
                                                onClick={() => addArrayItem('leftFeatures')}
                                                className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                            >
                                                <FaPlus className="text-[10px]" /> Add Feature
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(formData.leftFeatures || []).map((feature, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={feature}
                                                        onChange={(e) => handleArrayChange('leftFeatures', index, e.target.value)}
                                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96]`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayItem('leftFeatures', index)}
                                                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-100 transition-colors focus:outline-none"
                                                    >
                                                        <FaTrash className="text-[10px]" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Right Features</label>
                                            <button 
                                                type="button" 
                                                onClick={() => addArrayItem('rightFeatures')}
                                                className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                            >
                                                <FaPlus className="text-[10px]" /> Add Feature
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(formData.rightFeatures || []).map((feature, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={feature}
                                                        onChange={(e) => handleArrayChange('rightFeatures', index, e.target.value)}
                                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96]`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayItem('rightFeatures', index)}
                                                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-100 transition-colors focus:outline-none"
                                                    >
                                                        <FaTrash className="text-[10px]" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 pt-4 border-t border-gray-50">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority Statement</label>
                                    <input
                                        type="text"
                                        name="priorityStatement"
                                        required
                                        value={formData.priorityStatement}
                                        onChange={handleInputChange}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>
                        )}

                        {/* MORE ABOUT SECTION */}
                        {activeSection === 'more' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">More About Section</h3>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                    <input
                                        type="text"
                                        name="moreAboutTitle"
                                        required
                                        value={formData.moreAboutTitle}
                                        onChange={handleInputChange}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                                    <textarea
                                        rows="3"
                                        name="moreAboutDescription"
                                        required
                                        value={formData.moreAboutDescription}
                                        onChange={handleInputChange}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Main Image</label>
                                        <input
                                            type="file"
                                            onChange={(e) => handleImageUploadMock(e, 'moreAboutImage')}
                                            accept="image/*"
                                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-500 outline-none focus:border-[#3D3F96]"
                                        />
                                        {formData.moreAboutImage && (
                                            <div className="mt-2 h-20 w-32 overflow-hidden rounded-xl border border-gray-100">
                                                <ImageWithFallback src={formData.moreAboutImage} alt="Main" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Side Image</label>
                                        <input
                                            type="file"
                                            onChange={(e) => handleImageUploadMock(e, 'moreAboutSideImage')}
                                            accept="image/*"
                                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-500 outline-none focus:border-[#3D3F96]"
                                        />
                                        {formData.moreAboutSideImage && (
                                            <div className="mt-2 h-20 w-32 overflow-hidden rounded-xl border border-gray-100">
                                                <ImageWithFallback src={formData.moreAboutSideImage} alt="Side" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 pt-4 border-t border-gray-50">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Side Description</label>
                                    <textarea
                                        rows="3"
                                        name="moreAboutSideDescription"
                                        required
                                        value={formData.moreAboutSideDescription}
                                        onChange={handleInputChange}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                    />
                                </div>
                            </div>
                        )}

                        {/* CARDS SECTION */}
                        {activeSection === 'cards' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Feature Cards</h3>
                                    <button
                                        type="button"
                                        onClick={() => addObjectArrayItem('cards', { title: '', description: '', image: '', backgroundColor: '#ffffff' })}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add Card
                                    </button>
                                </div>

                                {(formData.cards || []).map((card, index) => (
                                    <div key={index} className="relative bg-white border border-l-4 border-l-[#3D3F96] border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('cards', index)}
                                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 focus:outline-none transition-colors"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={card.title}
                                                    onChange={(e) => handleObjectArrayChange('cards', index, 'title', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Background Color</label>
                                                <input
                                                    type="color"
                                                    required
                                                    value={card.backgroundColor}
                                                    onChange={(e) => handleObjectArrayChange('cards', index, 'backgroundColor', e.target.value)}
                                                    className={`h-8 w-20 border border-gray-200 rounded-xl p-0.5 cursor-pointer`}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                            <textarea
                                                rows="2"
                                                required
                                                value={card.description}
                                                onChange={(e) => handleObjectArrayChange('cards', index, 'description', e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] resize-none`}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Image</label>
                                            <input
                                                type="file"
                                                onChange={(e) => handleImageUploadMock(e, 'cards', index)}
                                                accept="image/*"
                                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 text-xs text-gray-500 outline-none"
                                            />
                                            {card.image && (
                                                <div className="mt-2 h-16 w-16 overflow-hidden rounded-xl border border-gray-100">
                                                    <ImageWithFallback src={card.image} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* MISSION, VISION & VALUES SECTION */}
                        {activeSection === 'mission' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mission, Vision &amp; Values</h3>
                                    <button
                                        type="button"
                                        onClick={() => addObjectArrayItem('missionVision', { type: 'mission', title: '', description: '', icon: '', backgroundColor: '#ffffff' })}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add Item
                                    </button>
                                </div>

                                {(formData.missionVision || []).map((item, index) => (
                                    <div key={index} className="relative bg-white border border-l-4 border-l-[#3D3F96] border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('missionVision', index)}
                                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 focus:outline-none transition-colors"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</label>
                                                <select
                                                    value={item.type}
                                                    onChange={(e) => handleObjectArrayChange('missionVision', index, 'type', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                >
                                                    <option value="mission">Mission</option>
                                                    <option value="vision">Vision</option>
                                                    <option value="values">Values</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={item.title}
                                                    onChange={(e) => handleObjectArrayChange('missionVision', index, 'title', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Background Color</label>
                                                <input
                                                    type="color"
                                                    required
                                                    value={item.backgroundColor}
                                                    onChange={(e) => handleObjectArrayChange('missionVision', index, 'backgroundColor', e.target.value)}
                                                    className={`h-8 w-20 border border-gray-200 rounded-xl p-0.5 cursor-pointer`}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Icon (Font Awesome class)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={item.icon}
                                                    onChange={(e) => handleObjectArrayChange('missionVision', index, 'icon', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                    placeholder="e.g. fa-shield, fa-eye, fa-heart"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                                <textarea
                                                    rows="2"
                                                    required
                                                    value={item.description}
                                                    onChange={(e) => handleObjectArrayChange('missionVision', index, 'description', e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] resize-none`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* INSURANCE SECTION */}
                        {activeSection === 'insurance' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Insurance Section</h3>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Insurance Section Title</label>
                                    <input
                                        type="text"
                                        name="insuranceTitle"
                                        required
                                        value={formData.insuranceTitle}
                                        onChange={handleInputChange}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Insurance Partner Logos</label>
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem('insuranceLogos', '')}
                                            className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                        >
                                            <FaPlus className="text-[10px]" /> Add Logo
                                        </button>
                                    </div>

                                    {(formData.insuranceLogos || []).map((logo, index) => (
                                        <div key={index} className="relative bg-white border border-l-4 border-l-[#3D3F96] border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('insuranceLogos', index)}
                                                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-rose-500 focus:outline-none transition-colors"
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logo URL / Path</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={logo}
                                                        onChange={(e) => handleArrayChange('insuranceLogos', index, e.target.value)}
                                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96]`}
                                                        placeholder="Logo URL"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Upload New Logo</label>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleImageUploadMock(e, 'insuranceLogos', index)}
                                                        accept="image/*"
                                                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 text-xs text-gray-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {logo && (
                                                <div className="mt-2 h-12 w-28 overflow-hidden rounded-xl border border-gray-100">
                                                    <ImageWithFallback src={logo} alt={`Logo ${index + 1}`} className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ADDITIONAL CONTENT */}
                        {activeSection === 'additional' && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-fadeIn">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Additional Content</h3>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Additional Content Markup</label>
                                    <textarea
                                        rows="5"
                                        name="additionalContent"
                                        value={formData.additionalContent}
                                        onChange={handleInputChange}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                        placeholder="Any additional content for the About Us page..."
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}