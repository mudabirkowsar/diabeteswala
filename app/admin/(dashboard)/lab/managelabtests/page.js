"use client";
import React, { useState, useEffect } from 'react';
import {
    Search,
    FlaskConical,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
    Upload,
    Trash2,
    Edit3,
    Activity,
    AlertTriangle,
    Tag,
    Layers,
    CheckCircle2,
    XCircle,
    TestTube2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import BulkUploadLabTestsModal from './components/BulkUploadLabTestsModal';
import LabTestDetailsModal from './components/LabTestDetailsModal';
import EditLabTestModal from './components/EditLabTestModal';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

export default function MasterLabTestsPage() {
    // --- Data Listings ---
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // --- Search & Pagination States ---
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // --- Modal Configuration States ---
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDetailTest, setSelectedDetailTest] = useState(null);
    const [editingTest, setEditingTest] = useState(null);

    // --- Delete Confirmation State ---
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // --- Unified Fetch Routine ---
    const fetchMasterTests = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getMasterTestsList(currentPage);
            if (response && response.success) {
                setTests(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.total || 0);
            } else {
                toast.error(response?.message || "Failed to load master tests.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Could not retrieve master test catalog.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMasterTests();
    }, [currentPage]);

    // Client-side quick filter for the currently loaded records
    const filteredTests = tests.filter((test) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            test.testName?.toLowerCase().includes(q) ||
            test.testCode?.toLowerCase().includes(q) ||
            test.mainCategory?.toLowerCase().includes(q) ||
            test.category?.toLowerCase().includes(q) ||
            test.sampleType?.toLowerCase().includes(q)
        );
    });

    // --- Execute Test Deletion ---
    const handleDeleteExecute = async () => {
        if (!deleteConfirmId) return;
        setActionLoading(true);
        try {
            const response = await AdminAPI.deleteMasterTest(deleteConfirmId);
            if (response && response.success) {
                toast.success(response.message || "Test removed permanently.");
                setDeleteConfirmId(null);
                fetchMasterTests();
            } else {
                toast.error(response?.message || "Failed to delete test.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred while deleting the test.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSuccessCallback = () => {
        setShowUploadModal(false);
        setEditingTest(null);
        fetchMasterTests();
    };

    return (
        <main className="min-h-screen py-0 px-0 sm:px-6 lg:px-0 antialiased select-none">
            <Toaster position="top-right" />

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <FlaskConical className="text-[#3d3f96]" /> Master Lab Tests
                    </h1>
                    <p className="text-slate-500 font-semibold text-xs mt-1">
                        Manage central diagnostic catalog, test parameters, sample types, and bulk upload test sheets.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
                    >
                        <Upload size={14} /> Bulk Import (Excel / CSV)
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
                            placeholder="Filter by test name, code (e.g. LPL001), category, or sample type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Reset Button */}
                    <div className="md:col-span-1 flex items-center justify-center">
                        <button
                            onClick={() => setSearchQuery("")}
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
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling Master Lab Directory...</p>
                </div>
            ) : filteredTests.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1050px] table-auto align-middle">
                            <thead>
                                <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-center px-6 py-4 w-16">S No.</th>
                                    <th className="text-left px-6 py-4 w-32">Test Code</th>
                                    <th className="text-left px-6 py-4">Test Profile</th>
                                    <th className="text-left px-6 py-4">Classification</th>
                                    {/* <th className="text-left px-6 py-4 w-36">Specimen</th> */}
                                    <th className="text-left px-6 py-4 w-32">Standard MRP</th>
                                    <th className="text-center px-6 py-4 w-28">Parameters</th>
                                    <th className="text-center px-6 py-4 w-24">Status</th>
                                    <th className="text-center px-6 py-4 w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredTests.map((test, index) => (
                                    <tr key={test._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                                        
                                        {/* S No. */}
                                        <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                                            {String((currentPage - 1) * 20 + index + 1).padStart(2, "0")}
                                        </td>

                                        {/* Test Code */}
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-[#3d3f96] border border-indigo-100/60 font-black text-xs uppercase tracking-wider">
                                                {test.testCode || "N/A"}
                                            </span>
                                        </td>

                                        {/* Test Name & Gender */}
                                        <td className="px-6 py-4">
                                            <h3 className="font-bold text-slate-800 tracking-tight leading-tight max-w-[280px] truncate" title={test.testName}>
                                                {test.testName}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                                Eligibility: <span className="font-bold text-slate-600">{test.gender || "Both"}</span>
                                            </p>
                                        </td>

                                        {/* Main & Sub Category */}
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="text-xs font-bold text-slate-700 truncate max-w-[200px]" title={test.mainCategory}>
                                                {test.mainCategory || "General Pathology"}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[180px]" title={test.category}>
                                                {test.category || "Uncategorized"}
                                            </div>
                                        </td>

                                        {/* Sample Specimen */}
                                        {/* <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                <TestTube2 size={13} className="text-rose-500" />
                                                {test.sampleType || "N/A"}
                                            </span>
                                        </td> */}

                                        {/* Pricing */}
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-extrabold text-slate-800">
                                                ₹ {Number(test.standardMRP || 0).toLocaleString('en-IN')}
                                            </span>
                                        </td>

                                        {/* Parameters Count */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                                                {Array.isArray(test.parameters) ? test.parameters.length : 0} items
                                            </span>
                                        </td>

                                        {/* Active Status */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                                test.isActive !== false
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                                {test.isActive !== false ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setSelectedDetailTest(test)}
                                                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                                                    title="Inspect Test Profile"
                                                >
                                                    <Eye size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingTest(test)}
                                                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#3d3f96] text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                                                    title="Edit Master Test"
                                                >
                                                    <Edit3 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(test._id)}
                                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100/50 transition-all cursor-pointer"
                                                    title="Delete Master Test"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <FlaskConical size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold px-4">No master lab tests matched your search criteria.</p>
                </div>
            )}

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1 || loading}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-500">
                        Page {currentPage} of {totalPages} ({totalItems} tests total)
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

            {/* --- MODAL DIALOGS --- */}

            {/* 1. Bulk Upload (Excel / CSV) */}
            <BulkUploadLabTestsModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={handleSuccessCallback}
            />

            {/* 2. Details Inspection Modal */}
            <LabTestDetailsModal
                test={selectedDetailTest}
                onClose={() => setSelectedDetailTest(null)}
            />

            {/* 3. Edit Test Modal */}
            <EditLabTestModal
                isOpen={Boolean(editingTest)}
                testData={editingTest}
                onClose={() => setEditingTest(null)}
                onSuccess={handleSuccessCallback}
            />

            {/* 4. Delete Confirmation Dialog */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />

                    <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Remove Master Test</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            Are you sure you want to permanently delete this test profile from the diagnostic catalog? This action cannot be reversed.
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