"use client";

import { useState, useEffect } from "react";
import { 
    FaUserMd, FaSearch, FaFilter, FaUndo, FaSync, 
    FaPlus, FaTrash, FaTimes, FaCheck, FaInfoCircle, 
    FaSlidersH, FaFileContract, FaHeart, FaClipboard, 
    FaShieldAlt, FaPlusCircle, FaArrowRight, FaUpload, FaImage 
} from "react-icons/fa";

export default function DoctorsScreenSetting() {
    const [activeTab, setActiveTab] = useState("findDoctor"); // 'findDoctor', 'findConsultant', 'priority', 'secure'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Theme Color Tokens based on #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // 1. Standalone Mock States for all 4 Tabs (No API dependency)
    
    // Tab 1: Find My Doctor State
    const [findDoctor, setFindDoctor] = useState({
        tagline: "100% Secure Consultations",
        headingPart1: "Find My",
        headingPart2: "Health Specialist",
        desc: "Consult with highly qualified, certified medical experts online or in-person for personalized care."
    });

    // Tab 2: Find My Consultant State
    const [findConsultant, setFindConsultant] = useState({
        tagline: "Expert Guidance",
        title: "Find Your Consultant",
        subtitle: "Professional Advice",
        desc: "Get specialized support, guidance, and medical consultation from our top clinical experts."
    });

    // Tab 3: Doctors Priority State (With interactive list points)
    const [priorityTitle, setPriorityTitle] = useState("Why Choose Our Doctors?");
    const [priorityDesc, setPriorityDesc] = useState("We prioritize your health and well-being above everything else.");
    const [priorityPoints, setPriorityPoints] = useState([
        "24/7 Availability",
        "Experienced Specialists",
        "Instant Booking"
    ]);
    const [priorityFile, setPriorityFile] = useState(null);

    // Tab 4: How To Secure State (With interactive cards grid)
    const [secureHeader, setSecureHeader] = useState("How To Secure Your Appointment!");
    const [secureTitle, setSecureTitle] = useState("We prioritize your health and well-being above everything else.");
    const [secureCards, setSecureCards] = useState([
        { id: 1, title: "Safe Data", desc: "100% Secure & Encrypted", icon: "Heart", theme: "Green" },
        { id: 2, title: "Verified Doctors", desc: "Checked backgrounds", icon: "Clipboard", theme: "Amber" }
    ]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Handlers for Tab 3 (Doctors Priority Points)
    const handleAddPoint = () => {
        setPriorityPoints([...priorityPoints, "New Feature Point"]);
    };

    const handlePointChange = (index, value) => {
        const updated = [...priorityPoints];
        updated[index] = value;
        setPriorityPoints(updated);
    };

    const handleRemovePoint = (index) => {
        setPriorityPoints(priorityPoints.filter((_, i) => i !== index));
    };

    // Handlers for Tab 4 (How To Secure Cards)
    const handleAddSecureCard = () => {
        const newId = secureCards.length > 0 ? Math.max(...secureCards.map(c => c.id)) + 1 : 1;
        setSecureCards([...secureCards, { id: newId, title: "New Card Title", desc: "Card Description", icon: "Shield", theme: "Indigo" }]);
    };

    const handleSecureCardChange = (id, field, value) => {
        setSecureCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleRemoveSecureCard = (id) => {
        setSecureCards(secureCards.filter(c => c.id !== id));
    };

    // Global Submit Handler
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            alert(`"${activeTab.toUpperCase()}" section updated successfully! (Mock Mode)`);
        }, 1200);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* PAGE TITLE */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                    <FaUserMd className="text-xl" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Doctors Screen Setting</h2>
                    <p className="text-xs text-gray-400">Configure, organize, and manage UI details of the doctor screening page</p>
                </div>
            </div>

            {/* TAB SELECTORS ROW */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                    { key: "findDoctor", label: "Find My Doctor" },
                    { key: "findConsultant", label: "Find My Consultant" },
                    { key: "priority", label: "Doctors Priority" },
                    { key: "secure", label: "How To Secure" }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus:outline-none shrink-0 ${
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
                       TAB 1: FIND MY DOCTOR FORM
                       ========================================== */}
                    {activeTab === "findDoctor" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Find My Doctor Section
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Small Accent Tagline</label>
                                <input 
                                    type="text" 
                                    required
                                    value={findDoctor.tagline}
                                    onChange={(e) => setFindDoctor({ ...findDoctor, tagline: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Main Heading (Part 1)</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={findDoctor.headingPart1}
                                        onChange={(e) => setFindDoctor({ ...findDoctor, headingPart1: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accent Heading (Part 2)</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={findDoctor.headingPart2}
                                        onChange={(e) => setFindDoctor({ ...findDoctor, headingPart2: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description Text</label>
                                <textarea 
                                    rows="3"
                                    required
                                    value={findDoctor.desc}
                                    onChange={(e) => setFindDoctor({ ...findDoctor, desc: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                />
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 2: FIND MY CONSULTANT FORM
                       ========================================== */}
                    {activeTab === "findConsultant" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Consultant Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mini Tagline</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={findConsultant.tagline}
                                        onChange={(e) => setFindConsultant({ ...findConsultant, tagline: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Main Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={findConsultant.title}
                                        onChange={(e) => setFindConsultant({ ...findConsultant, title: e.target.value })}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subtitle</label>
                                <input 
                                    type="text" 
                                    required
                                    value={findConsultant.subtitle}
                                    onChange={(e) => setFindConsultant({ ...findConsultant, subtitle: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description Content</label>
                                <textarea 
                                    rows="3"
                                    required
                                    value={findConsultant.desc}
                                    onChange={(e) => setFindConsultant({ ...findConsultant, desc: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                />
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 3: DOCTORS PRIORITY FORM (With interactive list points)
                       ========================================== */}
                    {activeTab === "priority" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage Doctors Priority Section
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={priorityTitle}
                                    onChange={(e) => setPriorityTitle(e.target.value)}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                <textarea 
                                    rows="2"
                                    required
                                    value={priorityDesc}
                                    onChange={(e) => setPriorityDesc(e.target.value)}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                />
                            </div>

                            {/* Interactive Feature Points List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Key Feature Points</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddPoint}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Point
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {priorityPoints.map((point, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input 
                                                type="text" 
                                                required
                                                value={point}
                                                onChange={(e) => handlePointChange(index, e.target.value)}
                                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemovePoint(index)}
                                                className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-100 transition-colors focus:outline-none"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section Images Upload */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Images</label>
                                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-6 cursor-pointer transition-colors group">
                                    <input 
                                        type="file" 
                                        onChange={(e) => setPriorityFile(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    />
                                    <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {priorityFile ? priorityFile.name : "Choose Files or Drag & Drop here"}
                                    </span>
                                    <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Supports PNG, JPG, JPEG</span>
                                </div>
                                
                                {/* Image Previews */}
                                <div className="grid grid-cols-3 gap-4 mt-3">
                                    <div className="h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="prev1" />
                                    </div>
                                    <div className="h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                        <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="prev2" />
                                    </div>
                                    <div className="h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                        <img src="https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="prev3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                       TAB 4: HOW TO SECURE FORM (With interactive cards grid)
                       ========================================== */}
                    {activeTab === "secure" && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
                                Manage How To Secure Section
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Small Top Header</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={secureHeader}
                                        onChange={(e) => setSecureHeader(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Big Main Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={secureTitle}
                                        onChange={(e) => setSecureTitle(e.target.value)}
                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                    />
                                </div>
                            </div>

                            {/* Dynamic Content Cards Grid */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content Cards</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddSecureCard}
                                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                                    >
                                        <FaPlus className="text-[10px]" /> Add New Card
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {secureCards.map((card) => (
                                        <div 
                                            key={card.id} 
                                            className={`relative bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-3 ${
                                                card.theme === "Green" ? "border-l-4 border-l-emerald-500" :
                                                card.theme === "Amber" ? "border-l-4 border-l-amber-500" :
                                                card.theme === "Red" ? "border-l-4 border-l-rose-500" : "border-l-4 border-l-indigo-500"
                                            }`}
                                        >
                                            {/* Delete card cross */}
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveSecureCard(card.id)}
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
                                                    onChange={(e) => handleSecureCardChange(card.id, "title", e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                                <textarea 
                                                    rows="2"
                                                    required
                                                    value={card.desc}
                                                    onChange={(e) => handleSecureCardChange(card.id, "desc", e.target.value)}
                                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Icon</label>
                                                    <select 
                                                        value={card.icon}
                                                        onChange={(e) => handleSecureCardChange(card.id, "icon", e.target.value)}
                                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] transition-all`}
                                                    >
                                                        <option value="Heart">Heart</option>
                                                        <option value="Clipboard">Clipboard</option>
                                                        <option value="Shield">Shield</option>
                                                    </select>
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Theme</label>
                                                    <select 
                                                        value={card.theme}
                                                        onChange={(e) => handleSecureCardChange(card.id, "theme", e.target.value)}
                                                        className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] transition-all`}
                                                    >
                                                        <option value="Green">Green</option>
                                                        <option value="Amber">Amber</option>
                                                        <option value="Red">Red</option>
                                                        <option value="Indigo">Indigo</option>
                                                    </select>
                                                </div>
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