"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    FaNewspaper, FaSearch, FaEye, FaTrash, FaTimes, 
    FaUser, FaRegCalendarAlt, FaQuoteLeft, FaInbox, 
    FaChevronLeft, FaChevronRight 
} from "react-icons/fa";

export default function AllBlogs() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Royal Indigo theme configurations based on #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // 1. Standalone Mock Data with realistic diabetic & health blog details
    const [blogs, setBlogs] = useState([
        { 
            id: 1, 
            title: "The Crucial Importance of our Premium Care Memberships", 
            description: "Understand how structured clinical care plans expedite diabetes reversal and long-term glycemic stability.", 
            type: "Doctor Tips", 
            conclusion: "Care memberships provide continuous medical coordination essential for optimal health reversal.", 
            createdBy: "Dr. Amit Verma",
            date: "Jul 16, 2026",
            image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=500&auto=format&fit=crop"
        },
        { 
            id: 2, 
            title: "Mindful Eating: Stabilizing Blood Sugar Levels Naturally", 
            description: "Learn the direct connection between emotional stress, mindfulness, and glycemic spikes.", 
            type: "Mind & Body", 
            conclusion: "A calm mind combined with conscious eating directly improves daily endocrine functions.", 
            createdBy: "Dr. Priya Sharma",
            date: "Jul 14, 2026",
            image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop"
        },
        { 
            id: 3, 
            title: "The Importance of Diabetes Medications & Proper Adherence", 
            description: "Why skipping oral hypoglycemic agents can lead to critical diabetic neuropathy complications.", 
            type: "Doctor Tips", 
            conclusion: "Strict medication adherence combined with fiber-rich diet is the cornerstone of reversal.", 
            createdBy: "Dr. Rajesh Choudhary",
            date: "Jul 12, 2026",
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop"
        },
        { 
            id: 4, 
            title: "5 Simple Doctor-Approved Habits to Manage Diabetes Better", 
            description: "Easy, daily clinical modifications that naturally lower blood glucose and boost metabolic rates.", 
            type: "Doctor Tips", 
            conclusion: "Small, consistent daily habit modifications lead to powerful clinical reversals.", 
            createdBy: "Dr. Anjali Verma",
            date: "Jul 10, 2026",
            image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop"
        },
        { 
            id: 5, 
            title: "Continuous Glucose Monitors: Real-time Glycemic Tracking", 
            description: "How wearable CGM sensors are changing the landscape of modern diabetic remote monitoring.", 
            type: "Monitoring", 
            conclusion: "Real-time feedback empowers patients to make instant and safer dietary corrections.", 
            createdBy: "Dr. Suresh Kumar",
            date: "Jul 08, 2026",
            image: "https://images.unsplash.com/photo-1551076805-e18690237571?w=500&auto=format&fit=crop"
        }
    ]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Interactive Search Filtering
    const filteredBlogs = useMemo(() => {
        return blogs.filter(b => 
            b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [blogs, searchTerm]);

    const handleOpenModal = (blog) => {
        setSelectedBlog(blog);
        setShowModal(true);
    };

    const handleRemoveBlog = (id) => {
        if (window.confirm("Are you sure you want to remove this blog?")) {
            setBlogs(prev => prev.filter(b => b.id !== id));
        }
    };

    // Category Badge style helper
    const getTypeClasses = (type) => {
        switch (type) {
            case "Doctor Tips":
                return "bg-indigo-50 text-[#3D3F96] border border-indigo-100";
            case "Mind & Body":
                return "bg-emerald-50 text-emerald-700 border border-emerald-100";
            case "Monitoring":
                return "bg-sky-50 text-sky-700 border border-sky-100";
            default:
                return "bg-gray-50 text-gray-600 border border-gray-100";
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* 1. TOP HEADER SECTION */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                    <FaNewspaper className="text-xl" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">All Blogs</h2>
                    <p className="text-xs text-gray-400">Review, publish, and manage all diabetic and health-related articles</p>
                </div>
            </div>

            {/* 2. SEARCH CONTROL BAR */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <div className="relative w-full md:w-80">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by title, author, or type..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-9 pr-4 py-2 w-full rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                    />
                </div>
            </div>

            {/* 3. BLOGS LIST DATA TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px] table-auto align-middle">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-center px-6 py-4 w-16">S.No</th>
                                <th className="text-left px-6 py-4">Title</th>
                                <th className="text-left px-6 py-4">Description</th>
                                <th className="text-center px-6 py-4 w-28">Type</th>
                                <th className="text-center px-6 py-4 w-24">Blog Image</th>
                                <th className="text-left px-6 py-4">Conclusion</th>
                                <th className="text-left px-6 py-4">Created By</th>
                                <th className="text-center px-6 py-4 w-36">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBlogs.length > 0 ? (
                                filteredBlogs.map((blog, index) => (
                                    <tr 
                                        key={blog.id} 
                                        className="hover:bg-gray-50/60 transition-colors duration-150"
                                    >
                                        {/* S.No */}
                                        <td className="px-6 py-4 text-center font-bold text-gray-400 text-xs">
                                            {index + 1}
                                        </td>

                                        {/* Title */}
                                        <td className="px-6 py-4 font-bold text-gray-800 tracking-tight leading-tight max-w-[200px]">
                                            {blog.title}
                                        </td>

                                        {/* Description */}
                                        <td className="px-6 py-4 text-xs font-semibold text-gray-500 truncate max-w-[180px]" title={blog.description}>
                                            {blog.description}
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide ${getTypeClasses(blog.type)}`}>
                                                {blog.type}
                                            </span>
                                        </td>

                                        {/* Image */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-block relative w-9 h-9 rounded-lg overflow-hidden border border-gray-100 shadow-sm shrink-0">
                                                <img 
                                                    src={blog.image} 
                                                    alt={blog.title} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>

                                        {/* Conclusion */}
                                        <td className="px-6 py-4 text-xs font-semibold text-gray-500 truncate max-w-[180px]" title={blog.conclusion}>
                                            {blog.conclusion}
                                        </td>

                                        {/* Created By */}
                                        <td className="px-6 py-4 text-gray-500 font-bold text-xs whitespace-nowrap">
                                            {blog.createdBy}
                                        </td>

                                        {/* Actions (View/Remove) */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(blog)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#3D3F96]/10 text-[#3D3F96] hover:bg-[#3D3F96] hover:text-white transition-all focus:outline-none"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveBlog(blog.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-200 text-gray-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all focus:outline-none"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Empty Filtered State */
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <FaInbox className="text-3xl" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700">No Blogs Found</h4>
                                                <p className="text-xs text-slate-400 mt-1">Adjust your search parameters to view matching articles.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-wrap gap-4">
                    <button 
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                    >
                        <FaChevronLeft className="text-[10px]" /> Previous
                    </button>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Page 1 of 1
                    </span>
                    <button 
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                    >
                        Next <FaChevronRight className="text-[10px]" />
                    </button>
                </div>
            </div>

            {/* 4. PREMIUM BLOG DETAILS INFO MODAL */}
            {showModal && selectedBlog && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 select-none animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center shrink-0">
                                    <FaNewspaper className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-gray-800">Blog Details</h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">Diabeteswala Publications</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowModal(false); setSelectedBlog(null); }}
                                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors focus:outline-none"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body - Large Image & Meta */}
                        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
                            {/* Large Header Cover Image */}
                            <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 shrink-0">
                                <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Author & Category Info Row */}
                            <div className="flex flex-wrap gap-3 items-center text-xs font-semibold text-gray-600 bg-gray-50 p-4 rounded-xl">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${getTypeClasses(selectedBlog.type)}`}>
                                    {selectedBlog.type}
                                </span>
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center gap-1.5"><FaUser className="text-gray-400" /> Published By: <strong className="text-gray-800">{selectedBlog.createdBy}</strong></div>
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center gap-1.5"><FaRegCalendarAlt className="text-gray-400" /> Date: <strong className="text-gray-800">{selectedBlog.date}</strong></div>
                            </div>

                            {/* Full Title & Long Description */}
                            <div className="space-y-3">
                                <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">{selectedBlog.title}</h2>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium">{selectedBlog.description}</p>
                            </div>

                            {/* Styled Conclusion Block */}
                            <div className="bg-[#3D3F96]/5 border border-indigo-100/50 rounded-2xl p-5 flex items-start gap-4">
                                <FaQuoteLeft className="text-[#3D3F96] text-xl shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider leading-none">Conclusion Highlights</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">{selectedBlog.conclusion}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 shrink-0">
                            <button 
                                type="button" 
                                onClick={() => { setShowModal(false); setSelectedBlog(null); }}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}