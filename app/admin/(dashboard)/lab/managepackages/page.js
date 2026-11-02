"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Inbox,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    Loader2,
    FlaskConical,
    PackageCheck,
    Layers,
    RotateCcw,
    Building2,
    Calendar,
    Sparkles,
    TestTube2,
    AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import RequestInspectModal from './components/RequestInspectModal';
import ActionDecisionModal from './components/ActionDecisionModal';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

export default function MasterRequestsApprovalPage() {
    // --- Data Listings ---
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Search & Filters ---
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All"); // "All" | "Test" | "Package"
    const [selectedCategory, setSelectedCategory] = useState("All");

    // --- Modal Configuration ---
    const [inspectRequest, setInspectRequest] = useState(null);
    const [actionModalState, setActionModalState] = useState({
        isOpen: false,
        request: null,
        decision: 'Approved' // 'Approved' | 'Rejected'
    });

    // --- Fetch Pending Requests ---
    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getPendingLabPackageRequest();
            if (response && response.success) {
                setRequests(response.data || []);
            } else {
                toast.error(response?.message || "Failed to load pending requests.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Could not retrieve pending catalog requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    // --- DYNAMICALLY EXTRACT MAIN CATEGORIES FROM PENDING REQUESTS ---
    const dynamicCategories = useMemo(() => {
        if (!requests || requests.length === 0) return ["All"];

        const categories = requests
            .map((r) => r.data?.mainCategory?.trim())
            .filter((c) => Boolean(c));

        return ["All", ...Array.from(new Set(categories))];
    }, [requests]);

    // Keep filter valid
    useEffect(() => {
        if (selectedCategory !== "All" && !dynamicCategories.includes(selectedCategory)) {
            setSelectedCategory("All");
        }
    }, [dynamicCategories, selectedCategory]);

    // --- FILTER REQUESTS BY SEARCH, TYPE, AND DYNAMIC MAIN CATEGORY ---
    const filteredRequests = useMemo(() => {
        return requests.filter((item) => {
            // Type Match
            const matchesType = typeFilter === "All" || item.requestType === typeFilter;

            // Category Match
            const matchesCategory =
                selectedCategory === "All" ||
                item.data?.mainCategory?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

            // Search Match
            const q = searchQuery.toLowerCase().trim();
            const itemName = (item.data?.testName || item.data?.packageName || "").toLowerCase();
            const vendorName = (item.vendorId?.name || "").toLowerCase();
            const subCategory = (item.data?.category || "").toLowerCase();

            const matchesQuery =
                !q ||
                itemName.includes(q) ||
                vendorName.includes(q) ||
                subCategory.includes(q);

            return matchesType && matchesCategory && matchesQuery;
        });
    }, [requests, typeFilter, selectedCategory, searchQuery]);

    // Reset Filters
    const handleResetFilters = () => {
        setSearchQuery("");
        setTypeFilter("All");
        setSelectedCategory("All");
    };

    // Callback on successful approval or rejection
    const handleActionSuccess = () => {
        setActionModalState({ isOpen: false, request: null, decision: 'Approved' });
        setInspectRequest(null);
        fetchPendingRequests();
    };

    // Counts for UI badges
    const testRequestsCount = requests.filter(r => r.requestType === 'Test').length;
    const packageRequestsCount = requests.filter(r => r.requestType === 'Package').length;

    return (
        <main className="min-h-screen py-0 px-0 sm:px-6 lg:px-0 antialiased select-none">
            <Toaster position="top-right" />

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Inbox className="text-[#3d3f96]" /> Vendor Catalog Requests
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                            {requests.length} Pending
                        </span>
                    </h1>
                    <p className="text-slate-500 font-semibold text-xs mt-1">
                        Review, verify, and approve new tests or health packages suggested by laboratory vendors to list them on the master platform.
                    </p>
                </div>
            </div>

            {/* --- FILTERS TOOLBAR --- */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col gap-4">
                
                {/* Upper Row: Search & Category Dropdown */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Search Field */}
                    <div className="md:col-span-8 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by test/package title, requesting lab vendor, or subcategory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Dynamic Main Category Dropdown */}
                    <div className="md:col-span-3 relative">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer appearance-none"
                        >
                            {dynamicCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat === "All" ? "All Main Categories" : cat}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                            ▼
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="md:col-span-1 flex items-center justify-center">
                        <button
                            onClick={handleResetFilters}
                            title="Reset all filters"
                            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>
                </div>

                {/* Lower Row: Request Type Switcher Pills */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                    <button
                        onClick={() => setTypeFilter("All")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            typeFilter === "All"
                                ? "bg-[#3d3f96] text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        All Proposals ({requests.length})
                    </button>
                    <button
                        onClick={() => setTypeFilter("Test")}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            typeFilter === "Test"
                                ? "bg-[#3d3f96] text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        <FlaskConical size={12} /> Tests ({testRequestsCount})
                    </button>
                    <button
                        onClick={() => setTypeFilter("Package")}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            typeFilter === "Package"
                                ? "bg-[#3d3f96] text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        <PackageCheck size={12} /> Packages ({packageRequestsCount})
                    </button>
                </div>
            </div>

            {/* --- REQUESTS TABLE --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying Vendor Proposal Registry...</p>
                </div>
            ) : filteredRequests.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1100px] table-auto align-middle">
                            <thead>
                                <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-center px-6 py-4 w-16">S No.</th>
                                    {/* <th className="text-center px-6 py-4 w-28">Type</th> */}
                                    <th className="text-left px-6 py-4">Proposed Title</th>
                                    <th className="text-left px-6 py-4 w-48">Requesting Vendor</th>
                                    <th className="text-left px-6 py-4 w-40">Classification</th>
                                    <th className="text-left px-6 py-4 w-32">Proposed MRP</th>
                                    {/* <th className="text-left px-6 py-4 w-36">Submitted Date</th> */}
                                    <th className="text-center px-6 py-4 w-40">Decision Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRequests.map((req, index) => {
                                    const isTest = req.requestType === 'Test';
                                    const title = isTest ? req.data?.testName : req.data?.packageName;
                                    const mainCat = req.data?.mainCategory || "Unassigned";
                                    const subCat = req.data?.category || "General";
                                    const mrp = Number(req.data?.standardMRP || 0);
                                    const vendorName = req.vendorId?.name || "Independent Lab";

                                    return (
                                        <tr key={req._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                                            
                                            {/* S No. */}
                                            <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                                                {String(index + 1).padStart(2, "0")}
                                            </td>

                                            {/* Type Badge */}
                                            {/* <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                                                    isTest
                                                        ? 'bg-indigo-50 text-[#3d3f96] border-indigo-100'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                }`}>
                                                    {isTest ? <FlaskConical size={11} /> : <PackageCheck size={11} />}
                                                    {req.requestType}
                                                </span>
                                            </td> */}

                                            {/* Proposed Title */}
                                            <td className="px-6 py-4">
                                                <h3 className="font-bold text-slate-800 tracking-tight leading-tight max-w-[280px] truncate" title={title}>
                                                    {title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold">
                                                    {isTest ? (
                                                        <span>Specimen: <strong className="text-slate-600">{req.data?.sampleType || "Blood"}</strong></span>
                                                    ) : (
                                                        <span>Includes: <strong className="text-slate-600">{req.data?.tests?.length || 0} Tests</strong></span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Requesting Vendor */}
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 truncate max-w-[180px]" title={vendorName}>
                                                    <Building2 size={13} className="text-slate-400 shrink-0" />
                                                    {vendorName}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                                    ID: {typeof req.vendorId === 'object' ? req.vendorId?._id : req.vendorId}
                                                </span>
                                            </td>

                                            {/* Classification */}
                                            <td className="px-6 py-4 space-y-0.5">
                                                <div className="text-xs font-bold text-slate-700 truncate max-w-[150px]" title={mainCat}>
                                                    {mainCat}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-semibold uppercase truncate max-w-[150px]">
                                                    {subCat}
                                                </div>
                                            </td>

                                            {/* Proposed MRP */}
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-black text-slate-800">
                                                    ₹ {mrp.toLocaleString('en-IN')}
                                                </span>
                                            </td>

                                            {/* Submitted Date */}
                                            {/* <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    {new Date(req.createdAt).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                                    {new Date(req.createdAt).toLocaleTimeString("en-IN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>
                                            </td> */}

                                            {/* Decision Action Buttons */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Inspect Full Specification */}
                                                    <button
                                                        onClick={() => setInspectRequest(req)}
                                                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                                                        title="Inspect full proposal"
                                                    >
                                                        <Eye size={13} />
                                                    </button>

                                                    {/* Quick Approve Trigger */}
                                                    <button
                                                        onClick={() => setActionModalState({
                                                            isOpen: true,
                                                            request: req,
                                                            decision: 'Approved'
                                                        })}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 text-xs font-bold transition-all cursor-pointer"
                                                        title="Approve & Publish to Master"
                                                    >
                                                        <CheckCircle2 size={13} /> Approve
                                                    </button>

                                                    {/* Quick Reject Trigger */}
                                                    <button
                                                        onClick={() => setActionModalState({
                                                            isOpen: true,
                                                            request: req,
                                                            decision: 'Rejected'
                                                        })}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold transition-all cursor-pointer"
                                                        title="Reject Proposal"
                                                    >
                                                        <XCircle size={13} /> Reject
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
                    <p className="text-slate-700 font-bold text-sm">All vendor proposals have been processed!</p>
                    <p className="text-slate-400 font-medium text-xs mt-1">There are no pending lab requests awaiting admin review.</p>
                </div>
            )}

            {/* --- MODAL DIALOGS --- */}

            {/* 1. Proposal Inspection Dialog */}
            <RequestInspectModal
                request={inspectRequest}
                onClose={() => setInspectRequest(null)}
                onApprove={(req) => {
                    setInspectRequest(null);
                    setActionModalState({ isOpen: true, request: req, decision: 'Approved' });
                }}
                onReject={(req) => {
                    setInspectRequest(null);
                    setActionModalState({ isOpen: true, request: req, decision: 'Rejected' });
                }}
            />

            {/* 2. Decision Modal (Approve or Reject with Custom Comments) */}
            <ActionDecisionModal
                isOpen={actionModalState.isOpen}
                request={actionModalState.request}
                initialDecision={actionModalState.decision}
                onClose={() => setActionModalState({ isOpen: false, request: null, decision: 'Approved' })}
                onSuccess={handleActionSuccess}
            />

        </main>
    );
}