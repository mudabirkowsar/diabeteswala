"use client";
import React, { useState, useEffect } from 'react';
import {
    Search,
    PackagePlus,
    PackageCheck,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
    Plus,
    Trash2,
    Edit3,
    Activity,
    AlertTriangle,
    Clock,
    TestTube2,
    Tag,
    Layers,
    Sparkles,
    ShieldAlert
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import PackageDetailsModal from './components/PackageDetailsModal';
import PackageFormModal from './components/PackageFormModal';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

export default function MasterLabPackagesPage() {
    // --- Data Listings ---
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // --- Search & Pagination States ---
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // --- Modal Configuration States ---
    const [selectedDetailPackage, setSelectedDetailPackage] = useState(null);
    const [formModalState, setFormModalState] = useState({ isOpen: false, editData: null });

    // --- Delete Confirmation State ---
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // --- Unified Fetch Router (Handles Paginated List vs Search API) ---
    const fetchPackagesData = async () => {
        setLoading(true);
        try {
            let response;
            if (searchQuery.trim()) {
                response = await AdminAPI.searchMasterPackages(searchQuery.trim());
                if (response && response.success) {
                    setPackages(response.data || []);
                    setTotalPages(1);
                    setTotalItems(response.data?.length || 0);
                } else {
                    toast.error(response?.message || "Search failed.");
                }
            } else {
                response = await AdminAPI.getMasterPackagesList(currentPage);
                if (response && response.success) {
                    setPackages(response.data || []);
                    setTotalPages(response.totalPages || 1);
                    setTotalItems(response.total || 0);
                } else {
                    toast.error(response?.message || "Failed to load packages.");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Could not retrieve lab packages.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        fetchPackagesData();
    }, [currentPage, searchQuery]);

    const handleSearchInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            fetchPackagesData();
        }
    };

    // --- Delete Package Call ---
    const handleDeleteExecute = async () => {
        if (!deleteConfirmId) return;
        setActionLoading(true);
        try {
            const response = await AdminAPI.deleteMasterPackage(deleteConfirmId);
            if (response && response.success) {
                toast.success(response.message || "Health package deleted permanently.");
                setDeleteConfirmId(null);
                fetchPackagesData();
            } else {
                toast.error(response?.message || "Failed to delete package.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error deleting the health package.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSuccessCallback = () => {
        setFormModalState({ isOpen: false, editData: null });
        fetchPackagesData();
    };

    return (
        <main className="min-h-screen py-0 px-0 sm:px-6 lg:px-0 antialiased select-none">
            <Toaster position="top-right" />

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <PackageCheck className="text-[#3d3f96]" /> Master Health Packages
                    </h1>
                    <p className="text-slate-500 font-semibold text-xs mt-1">
                        Configure master diagnostic packages, bundle clinical tests, set turnaround times, and manage baseline pricing.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <button
                        onClick={() => setFormModalState({ isOpen: true, editData: null })}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
                    >
                        <Plus size={14} /> Create Master Package
                    </button>
                </div>
            </div>

            {/* --- SEARCH FILTER BAR --- */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Search Field */}
                    <div className="md:col-span-11 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search packages by title (e.g. Platinum, Full Body)... (Press Enter)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchInputKeyPress}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Reset Button */}
                    <div className="md:col-span-1 flex items-center justify-center">
                        <button
                            onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all text-center cursor-pointer"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* --- DATA TABLE --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Master Diagnostic Packages...</p>
                </div>
            ) : packages.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1100px] table-auto align-middle">
                            <thead>
                                <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-center px-6 py-4 w-16">S No.</th>
                                    <th className="text-left px-6 py-4">Package Profile</th>
                                    <th className="text-left px-6 py-4">Classification</th>
                                    <th className="text-center px-6 py-4 w-32">Included Tests</th>
                                    <th className="text-left px-6 py-4 w-36">Samples & Fasting</th>
                                    <th className="text-left px-6 py-4 w-32">Package MRP</th>
                                    <th className="text-center px-6 py-4 w-28">Report Time</th>
                                    <th className="text-center px-6 py-4 w-24">Status</th>
                                    <th className="text-center px-6 py-4 w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {packages.map((pkg, index) => {
                                    const testCount = Array.isArray(pkg.tests) ? pkg.tests.length : 0;

                                    return (
                                        <tr key={pkg._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                                            
                                            {/* S No. */}
                                            <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                                                {String((currentPage - 1) * 20 + index + 1).padStart(2, "0")}
                                            </td>

                                            {/* Package Title & Demographic */}
                                            <td className="px-6 py-4">
                                                <h3 className="font-bold text-slate-800 tracking-tight leading-tight max-w-[280px] truncate" title={pkg.packageName}>
                                                    {pkg.packageName}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-slate-400 font-semibold">
                                                        Gender: <strong className="text-slate-600">{pkg.gender || "Both"}</strong>
                                                    </span>
                                                    <span className="text-[10px] text-slate-300">•</span>
                                                    <span className="text-[10px] text-slate-400 font-semibold">
                                                        Age: <strong className="text-slate-600">{pkg.ageGroup || "All"}</strong>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Classification */}
                                            <td className="px-6 py-4 space-y-1">
                                                <div className="text-xs font-bold text-slate-700 truncate max-w-[200px]" title={pkg.category}>
                                                    {pkg.category || "Full Body Checkup"}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[180px]">
                                                    {pkg.mainCategory || "Pathology"}
                                                </div>
                                            </td>

                                            {/* Tests Pill */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50/70 text-[#3d3f96] border border-indigo-100/50 font-black text-xs">
                                                    <Sparkles size={12} /> {testCount} Tests
                                                </span>
                                            </td>

                                            {/* Samples & Fasting */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                        <TestTube2 size={13} className="text-rose-500" />
                                                        {Array.isArray(pkg.sampleTypes) && pkg.sampleTypes.length > 0 
                                                            ? pkg.sampleTypes.join(", ") 
                                                            : "Blood, Urine"}
                                                    </span>
                                                    {pkg.isFastingRequired ? (
                                                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-block w-fit">
                                                            Fasting: {pkg.fastingDuration || "Required"}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-semibold">
                                                            Fasting not required
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Price */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-extrabold text-slate-800">
                                                    ₹ {Number(pkg.standardMRP || 0).toLocaleString('en-IN')}
                                                </span>
                                            </td>

                                            {/* Report Time */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                    <Clock size={11} className="text-slate-400" /> {pkg.reportTime || "24 Hours"}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                                    pkg.isActive !== false
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                    {pkg.isActive !== false ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedDetailPackage(pkg)}
                                                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                                                        title="Inspect Package Profile"
                                                    >
                                                        <Eye size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => setFormModalState({ isOpen: true, editData: pkg })}
                                                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#3d3f96] text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                                                        title="Edit Package Specifications"
                                                    >
                                                        <Edit3 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(pkg._id)}
                                                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100/50 transition-all cursor-pointer"
                                                        title="Delete Package"
                                                    >
                                                        <Trash2 size={13} />
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
                    <PackagePlus size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold px-4">No master health packages match your query parameters.</p>
                </div>
            )}

            {/* --- PAGINATION WRAPPER --- */}
            {totalPages > 1 && !searchQuery.trim() && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1 || loading}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-500">
                        Page {currentPage} of {totalPages} ({totalItems} packages total)
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages || loading}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* --- SUBCOMPONENT MODALS --- */}

            {/* 1. Detail Inspection View */}
            <PackageDetailsModal
                pkg={selectedDetailPackage}
                onClose={() => setSelectedDetailPackage(null)}
            />

            {/* 2. Create / Edit Package Modal */}
            <PackageFormModal
                isOpen={formModalState.isOpen}
                editData={formModalState.editData}
                onClose={() => setFormModalState({ isOpen: false, editData: null })}
                onSuccess={handleSuccessCallback}
            />

            {/* 3. Delete Confirmation Dialog */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />

                    <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Remove Master Package</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            Are you sure you want to permanently delete this health package? Users will no longer be able to book this bundled offering.
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full mt-6">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteExecute}
                                disabled={actionLoading}
                                className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                {actionLoading ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <span>Confirm Delete</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}