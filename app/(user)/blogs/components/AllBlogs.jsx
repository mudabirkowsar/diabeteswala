"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Clock,
    Eye,
    ArrowRight,
    BookOpen,
    Calendar,
    ChevronRight,
    MessageCircle,
    Filter
} from 'lucide-react';

// Replace this with your actual API service import
import UserAPI from '../../../services/UserAPI';

const BACKEND_IMAGE_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

function AllBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('All'); // State for filtering

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${BACKEND_IMAGE_BASE}${path}`;
    };

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await UserAPI.getAllBlogs();
                if (response && response.success === 1) {
                    setBlogs(response.data);
                } else {
                    setError("Failed to load articles.");
                }
            } catch (err) {
                setError("An error occurred while fetching blogs.");
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    // Logic to get unique types from the data
    const categories = ['All', ...new Set(blogs.map(blog => blog.type))];

    // Logic to filter blogs based on selected type
    const filteredBlogs = selectedType === 'All'
        ? blogs
        : blogs.filter(blog => blog.type === selectedType);

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-[#3d3f96] rounded-full animate-spin"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Knowledge Base...</p>
            </div>
        );
    }

    if (error) return <div className="py-20 text-center text-red-500 font-bold">{error}</div>;

    return (
        <section className="py-16 bg-white">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* --- Filter NavTabs --- */}
                <div className="flex flex-wrap items-center gap-3 mb-12 pb-4 border-b border-slate-50">
                    <div className="flex items-center gap-2 mr-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                        <Filter size={14} /> Filter By:
                    </div>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedType(cat)}
                            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${selectedType === cat
                                    ? 'bg-[#3d3f96] text-white shadow-lg shadow-indigo-100'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* --- Blogs Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredBlogs.map((blog, index) => (
                        <motion.div
                            key={blog._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-500"
                        >
                            {/* Image Container */}
                            <Link href={`/blogs/${blog._id}`} className="relative h-64 overflow-hidden block">
                                <img
                                    src={getImageUrl(blog.blogImage)}
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-md text-[#3d3f96] text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                                        {blog.type}
                                    </span>
                                </div>
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-[#3d3f96]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white p-3 rounded-full text-[#3d3f96] shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                        <ChevronRight size={24} />
                                    </div>
                                </div>
                            </Link>

                            {/* Content Section */}
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-[#3d3f96]" />
                                        {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye size={14} className="text-[#3d3f96]" />
                                        {blog.viewCount} Views
                                    </div>
                                </div>

                                <Link href={`/blogs/${blog._id}`}>
                                    <h3 className="text-xl font-black text-slate-800 leading-tight mb-4 group-hover:text-[#3d3f96] transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                </Link>

                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 line-clamp-3">
                                    {blog.description}
                                </p>

                                {/* Footer Action */}
                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <Link
                                        href={`/blogs/${blog._id}`}
                                        className="flex items-center gap-2 text-[#3d3f96] font-black text-xs uppercase tracking-widest group/btn"
                                    >
                                        Read Full Article
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                    <div className="text-slate-300">
                                        <MessageCircle size={18} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* --- Pagination Placeholder --- */}
                <div className="mt-20 flex justify-center">
                    <button className="bg-slate-50 text-slate-400 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#3d3f96] hover:text-white transition-all shadow-sm">
                        Load More Articles
                    </button>
                </div>
            </div>
        </section>
    );
}

export default AllBlogs;