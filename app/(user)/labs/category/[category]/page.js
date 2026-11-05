"use client";
import React, { useState, useEffect } from 'react';
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
    Loader2,
    X,
    Layers,
    Sparkles,
    Beaker,
    Filter
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI'; // Adjust relative path as needed
import { useNotification } from '../../../../context/NotificationContext'; // Adjust relative path as needed

export default function CategoryTestsPage() {
    const params = useParams();
    const router = useRouter();
    const { showNotification } = useNotification();

    // Decode Category URL Segment (e.g. "Clinical%20Pathology" -> "Clinical Pathology")
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

    // Fetch Tests for this specific category
    useEffect(() => {
        const fetchAllCategoryTests = async () => {
            try {
                setLoading(true);
                setError(false);

                const apiParams = {
                    category: categoryName,
                    page,
                    limit: 20,
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

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 antialiased text-slate-800">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- BREADCRUMB --- */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="hover:text-slate-700 flex items-center gap-1.5 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-200/50"
                    >
                        <ArrowLeft size={13} /> Back
                    </button>
                    <span className="text-slate-300">/</span>
                    <Link href="/labs" className="hover:text-slate-700 transition-colors">
                        Diagnostic Tests
                    </Link>
                    <ChevronRight size={12} className="text-slate-300" />
                    <span className="text-[#3d3f96] font-bold">{categoryName}</span>
                </div>

                {/* --- HEADER BANNER --- */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-3">
                            <Layers size={12} className="text-[#3d3f96]" />
                            <span className="text-[10px] font-black text-[#3d3f96] uppercase tracking-wider">
                                Category Directory
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {categoryName === "All" ? "All Diagnostic Tests" : `${categoryName} Tests`}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1.5">
                            Showing {totalCount} verified clinical tests offered by certified NABL laboratory partners
                        </p>
                    </div>

                    {/* Search Box within category */}
                    <div className="relative w-full md:w-80 shrink-0">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1); // Reset to page 1 on new search
                            }}
                            placeholder={`Search ${categoryName} tests...`}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-9 py-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/20 focus:border-[#3d3f96] transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* --- TESTS GRID --- */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 animate-pulse">
                                <div className="flex justify-between items-center">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100" />
                                    <div className="h-5 bg-slate-100 rounded-full w-20" />
                                </div>
                                <div className="h-4 bg-slate-200 rounded w-3/4" />
                                <div className="h-14 bg-slate-50 rounded-2xl" />
                                <div className="h-9 bg-slate-200 rounded-xl w-full mt-2" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl bg-rose-50/50 border border-rose-100 text-center">
                        <AlertCircle className="text-rose-500 mb-2" size={32} />
                        <h3 className="text-sm font-black text-slate-800">Failed to load tests</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">We couldn't connect to our diagnostic catalogue.</p>
                    </div>
                ) : tests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl bg-white border border-slate-200/80 text-center">
                        <Beaker className="text-slate-300 mx-auto mb-3" size={36} />
                        <h3 className="text-base font-extrabold text-slate-900">No Tests Found</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm">
                            {searchQuery ? `No tests match "${searchQuery}".` : `No tests currently listed under "${categoryName}".`}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {tests.map((test) => {
                                const hasDiscount = test.standardMRP && test.minPrice && test.standardMRP > test.minPrice;
                                const discountPercent = hasDiscount
                                    ? Math.round(((test.standardMRP - test.minPrice) / test.standardMRP) * 100)
                                    : 0;
                                const isAvailable = test.hasVendor === 1 || test.vendorCount > 0;

                                return (
                                    <div
                                        key={test._id}
                                        className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-[0_15px_35px_rgba(61,63,150,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <span className="text-[10px] font-extrabold bg-indigo-50 text-[#3d3f96] border border-indigo-100/60 px-2.5 py-0.5 rounded-lg uppercase tracking-wider truncate max-w-[170px]">
                                                    {test.category || test.mainCategory || "Pathology"}
                                                </span>
                                                {isAvailable ? (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                                        {test.vendorCount} Lab{test.vendorCount > 1 ? 's' : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                                                        Coming Soon
                                                    </span>
                                                )}
                                            </div>

                                            <h3
                                                className="text-sm font-extrabold text-slate-900 group-hover:text-[#3d3f96] transition-colors leading-snug line-clamp-2"
                                                title={test.testName}
                                            >
                                                {test.testName}
                                            </h3>

                                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 my-3 space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                                    <Droplets size={12} className="text-rose-500 shrink-0" />
                                                    <span className="truncate">Sample: {test.sampleType || "Blood"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                                                    <Clock size={12} className="text-amber-500 shrink-0" />
                                                    <span className="truncate">{test.pretestPreparation || "No fasting required"}</span>
                                                </div>
                                            </div>

                                            {test.parameters && test.parameters.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                                                        <FileText size={10} /> Biomarkers ({test.parameters.length}):
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {test.parameters.slice(0, 2).map((p, idx) => (
                                                            <span key={idx} className="text-[10px] font-semibold bg-white border border-slate-200/70 text-slate-600 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                                                                {p}
                                                            </span>
                                                        ))}
                                                        {test.parameters.length > 2 && (
                                                            <span className="text-[10px] font-bold text-[#3d3f96] self-center">
                                                                +{test.parameters.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                            <div>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-base font-black text-slate-900">
                                                        ₹{test.minPrice || test.standardMRP}
                                                    </span>
                                                    {hasDiscount && (
                                                        <span className="text-[11px] text-slate-400 line-through font-semibold">
                                                            ₹{test.standardMRP}
                                                        </span>
                                                    )}
                                                </div>
                                                {discountPercent > 0 && (
                                                    <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                                        {discountPercent}% OFF
                                                    </span>
                                                )}
                                            </div>

                                            <Link href={`/labs/testdetail/${test._id}`}>
                                                <button className="bg-[#3d3f96] hover:bg-[#323480] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-[#3d3f96]/20 transition-all active:scale-95">
                                                    <span>Book</span>
                                                    <ArrowRight size={12} className="stroke-[2.5]" />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-bold text-slate-500 px-2">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

            </div>
        </main>
    );
}