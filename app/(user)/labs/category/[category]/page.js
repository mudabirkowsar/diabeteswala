"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    ChevronRight,
    Search,
    Droplets,
    Clock,
    FileText,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    X,
    Layers,
    Sparkles,
    Beaker,
    Filter,
    ShieldCheck,
    SlidersHorizontal,
    Tag,
    UserCheck,
    TestTube,
    Building2,
    ChevronLeft
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

export default function CategoryTestsPage() {
    const params = useParams();
    const router = useRouter();
    const { showNotification } = useNotification();

    // Decode Category URL Segment
    const rawCategory = params?.category;
    const categoryName = decodeURIComponent(rawCategory || 'All');

    // Page States
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Client-side Filters & Sort
    const [sortBy, setSortBy] = useState("recommended"); // "recommended", "price_asc", "price_desc", "discount"
    const [filterGender, setFilterGender] = useState("all"); // "all", "Both", "Male", "Female"
    const [onlyAvailable, setOnlyAvailable] = useState(false);

    // Fetch tests
    useEffect(() => {
        const fetchAllCategoryTests = async () => {
            try {
                setLoading(true);
                setError(false);

                const apiParams = {
                    category: categoryName,
                    page,
                    limit: 24,
                    ...(searchQuery.trim() && { search: searchQuery.trim() })
                };

                const res = await UserAPI.getTestsByTestCategory(apiParams);

                if (res && res.success) {
                    setTests(res.data || []);
                    setTotalPages(res.totalPages || 1);
                    setTotalCount(res.total || 0);
                } else {
                    setTests([]);
                    setTotalPages(1);
                    setTotalCount(0);
                }
            } catch (err) {
                console.error("Error loading category tests:", err);
                setError(true);
                if (showNotification) {
                    showNotification("Failed to load tests for this category.", "error");
                }
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchAllCategoryTests();
        }, 250);

        return () => clearTimeout(debounceTimer);
    }, [categoryName, page, searchQuery, showNotification]);

    // Apply Sorting & Quick Filters
    const filteredAndSortedTests = useMemo(() => {
        let result = [...tests];

        // Gender filter
        if (filterGender !== 'all') {
            result = result.filter(item => 
                item.gender === filterGender || item.gender === 'Both' || !item.gender
            );
        }

        // Available in labs only
        if (onlyAvailable) {
            result = result.filter(item => (item.hasVendor === 1 || item.vendorCount > 0));
        }

        // Sorting
        if (sortBy === "price_asc") {
            result.sort((a, b) => (a.minPrice || a.standardMRP || 0) - (b.minPrice || b.standardMRP || 0));
        } else if (sortBy === "price_desc") {
            result.sort((a, b) => (b.minPrice || b.standardMRP || 0) - (a.minPrice || a.standardMRP || 0));
        } else if (sortBy === "discount") {
            result.sort((a, b) => {
                const discA = a.standardMRP && a.minPrice ? ((a.standardMRP - a.minPrice) / a.standardMRP) : 0;
                const discB = b.standardMRP && b.minPrice ? ((b.standardMRP - b.minPrice) / b.standardMRP) : 0;
                return discB - discA;
            });
        }

        return result;
    }, [tests, filterGender, onlyAvailable, sortBy]);

    // Sample badge color helper
    const getSampleStyle = (sampleType) => {
        const type = (sampleType || '').toLowerCase();
        if (type.includes('blood')) return 'bg-rose-50 text-rose-700 border-rose-100';
        if (type.includes('urine')) return 'bg-amber-50 text-amber-700 border-amber-100';
        if (type.includes('stool')) return 'bg-amber-100/70 text-amber-800 border-amber-200';
        if (type.includes('swab')) return 'bg-teal-50 text-teal-700 border-teal-100';
        return 'bg-blue-50 text-blue-700 border-blue-100';
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] antialiased text-slate-800 pb-16">
            
            {/* --- TOP ACCENT BANNER --- */}
            <div className="bg-gradient-to-r from-slate-900 via-[#1E2238] to-[#3D3F96] text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1360px] mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-300 mb-6 flex-wrap">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="hover:text-white flex items-center gap-1.5 transition-colors py-1 px-2.5 -ml-2 rounded-lg hover:bg-white/10"
                        >
                            <ArrowLeft size={13} /> Back
                        </button>
                        <span className="text-slate-500">/</span>
                        <Link href="/labs" className="hover:text-white transition-colors">
                            Diagnostic Tests
                        </Link>
                        <ChevronRight size={12} className="text-slate-500" />
                        <span className="text-indigo-200 font-semibold truncate max-w-[200px] sm:max-w-none">
                            {categoryName}
                        </span>
                    </nav>

                    {/* Headline and Search */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full mb-3 text-indigo-200 text-xs font-semibold">
                                <Sparkles size={13} className="text-amber-400" />
                                <span>Verified Pathology & Radiology</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                                {categoryName === "All" ? "All Diagnostic Tests" : categoryName}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-normal leading-relaxed">
                                Explore certified clinical tests with free doorstep sample collection, calibrated reports, and instant digital delivery.
                            </p>
                        </div>

                        {/* Search Bar in Banner */}
                        <div className="w-full lg:w-96 shrink-0">
                            <div className="relative">
                                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder={`Search in ${categoryName}...`}
                                    className="w-full bg-white/95 backdrop-blur-md text-slate-900 border-0 rounded-2xl pl-11 pr-10 py-3.5 text-xs sm:text-sm font-semibold placeholder:text-slate-400 shadow-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT & FILTER BAR --- */}
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                
                {/* FILTER / TOOLBAR BAR */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
                    
                    {/* Left: Total counts & quick pills */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <TestTube size={14} className="text-indigo-600" />
                            {totalCount} Total Tests
                        </span>

                        {/* Availability toggle */}
                        <button
                            type="button"
                            onClick={() => setOnlyAvailable(!onlyAvailable)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                                onlyAvailable 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-300' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <Building2 size={13} />
                            Available in Partner Labs
                        </button>
                    </div>

                    {/* Right: Gender Filter & Sorting */}
                    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                        {/* Gender filter */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                            {['all', 'Both', 'Male', 'Female'].map((gen) => (
                                <button
                                    key={gen}
                                    type="button"
                                    onClick={() => setFilterGender(gen)}
                                    className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                                        filterGender === gen 
                                            ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {gen}
                                </button>
                            ))}
                        </div>

                        {/* Sort select */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                            >
                                <option value="recommended">Recommended</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="discount">Biggest Discount</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- TESTS GRID SECTION --- */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, n) => (
                            <div key={n} className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 animate-pulse shadow-sm">
                                <div className="flex justify-between items-center">
                                    <div className="h-6 w-24 bg-slate-100 rounded-lg" />
                                    <div className="h-5 w-16 bg-slate-100 rounded-full" />
                                </div>
                                <div className="h-5 bg-slate-200 rounded-md w-4/5" />
                                <div className="h-3 bg-slate-100 rounded w-1/3" />
                                <div className="h-20 bg-slate-50 rounded-2xl p-3" />
                                <div className="h-10 bg-slate-100 rounded-xl w-full" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl bg-white border border-rose-100 text-center shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">Failed to load tests</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            We couldn't reach our diagnostic catalogue. Please refresh or try again.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredAndSortedTests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl bg-white border border-slate-200/80 text-center shadow-xs">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center mb-3">
                            <Beaker size={28} />
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900">No Tests Found</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            {searchQuery 
                                ? `No tests matched your search "${searchQuery}". Try a different keyword.` 
                                : `No tests are currently available matching the selected criteria.`}
                        </p>
                        {(searchQuery || filterGender !== 'all' || onlyAvailable) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterGender("all");
                                    setOnlyAvailable(false);
                                }}
                                className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3.5 py-2 rounded-xl transition"
                            >
                                Reset All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredAndSortedTests.map((test) => {
                                const mrp = Number(test.standardMRP) || 0;
                                const minP = Number(test.minPrice) || mrp;
                                const hasDiscount = mrp > minP;
                                const discountPercent = hasDiscount 
                                    ? Math.round(((mrp - minP) / mrp) * 100) 
                                    : 0;
                                const isAvailable = test.hasVendor === 1 || test.vendorCount > 0;
                                const sampleLabel = test.sampleType || "Blood";

                                return (
                                    <div
                                        key={test._id}
                                        className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-950/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                                    >
                                        {/* Optional Top Discount Accent Ribbon */}
                                        {discountPercent > 0 && (
                                            <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500 to-rose-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-bl-xl shadow-xs">
                                                {discountPercent}% OFF
                                            </div>
                                        )}

                                        <div>
                                            {/* Category & Lab Count Badges */}
                                            <div className="flex items-center gap-1.5 flex-wrap pr-14 mb-2.5">
                                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/70 px-2 py-0.5 rounded-md uppercase tracking-wider truncate max-w-[140px]">
                                                    {test.category || test.mainCategory || "Pathology"}
                                                </span>
                                                {test.testCode && (
                                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {test.testCode}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Test Title */}
                                            <h3 
                                                className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2"
                                                title={test.testName}
                                            >
                                                {test.testName}
                                            </h3>

                                            {/* Meta Specifications Box */}
                                            <div className="bg-slate-50/80 rounded-2xl p-3 my-3 border border-slate-100 space-y-2">
                                                {/* Sample Type */}
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <Droplets size={13} className="text-rose-500 shrink-0" />
                                                        <span>Sample:</span>
                                                    </div>
                                                    <span className={`font-semibold px-2 py-0.5 rounded-md text-[11px] border ${getSampleStyle(sampleLabel)}`}>
                                                        {sampleLabel}
                                                    </span>
                                                </div>

                                                {/* Fasting / Preparation */}
                                                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                                    <Clock size={12} className="text-amber-500 shrink-0" />
                                                    <span className="truncate">
                                                        {test.pretestPreparation || "No special preparation needed"}
                                                    </span>
                                                </div>

                                                {/* Gender Suitability */}
                                                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                                    <UserCheck size={12} className="text-indigo-500 shrink-0" />
                                                    <span>Applicable: <b>{test.gender || "Both (Male & Female)"}</b></span>
                                                </div>
                                            </div>

                                            {/* Biomarkers / Parameters pill preview */}
                                            {test.parameters && test.parameters.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                                        <span className="flex items-center gap-1">
                                                            <FileText size={11} /> Parameters Included:
                                                        </span>
                                                        <span className="text-indigo-600">{test.parameters.length} Test{test.parameters.length > 1 ? 's' : ''}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {test.parameters.slice(0, 2).map((param, index) => (
                                                            <span
                                                                key={index}
                                                                className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md truncate max-w-[125px]"
                                                            >
                                                                {param}
                                                            </span>
                                                        ))}
                                                        {test.parameters.length > 2 && (
                                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                                +{test.parameters.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer: Pricing & Action */}
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                            {/* Price block */}
                                            <div>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-lg font-black text-slate-900">
                                                        ₹{minP}
                                                    </span>
                                                    {hasDiscount && (
                                                        <span className="text-xs text-slate-400 line-through font-semibold">
                                                            ₹{mrp}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {isAvailable 
                                                        ? `${test.vendorCount} Lab${test.vendorCount > 1 ? 's' : ''} Available` 
                                                        : 'Collection on Request'}
                                                </p>
                                            </div>

                                            {/* Action Button */}
                                            <Link href={`/labs/testdetail/${test._id}`}>
                                                <button
                                                    type="button"
                                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                                                        isAvailable
                                                            ? 'bg-[#3D3F96] hover:bg-[#2F3175] text-white shadow-[#3D3F96]/20'
                                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                    }`}
                                                >
                                                    <span>{isAvailable ? "Book" : "Details"}</span>
                                                    <ArrowRight size={13} className="stroke-[2.5]" />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- PAGINATION BAR --- */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-slate-200/80 pt-6 mt-10">
                                <p className="text-xs font-medium text-slate-500">
                                    Showing page <b className="text-slate-800">{page}</b> of <b className="text-slate-800">{totalPages}</b>
                                </p>
                                
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPage((p) => Math.max(1, p - 1));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={page === 1}
                                        className="p-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1"
                                    >
                                        <ChevronLeft size={14} />
                                        <span className="hidden sm:inline">Previous</span>
                                    </button>

                                    {/* Quick Page pills */}
                                    <div className="flex items-center gap-1 px-1">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Show first, last, and window around current
                                            if (
                                                pageNum === 1 || 
                                                pageNum === totalPages || 
                                                (pageNum >= page - 1 && pageNum <= page + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        type="button"
                                                        onClick={() => {
                                                            setPage(pageNum);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                                                            page === pageNum
                                                                ? 'bg-[#3D3F96] text-white shadow-xs'
                                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (pageNum === page - 2 || pageNum === page + 2) {
                                                return <span key={pageNum} className="text-slate-400 text-xs px-0.5">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPage((p) => Math.min(totalPages, p + 1));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

            </div>
        </main>
    );
}