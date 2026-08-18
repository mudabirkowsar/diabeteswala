"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Pill,
    FileText,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
    X,
    RefreshCw,
    Award,
    Plus,
    Upload,
    Trash2,
    Edit3,
    DollarSign,
    Layers,
    Tag,
    Activity,
    Info,
    Check,
    AlertTriangle
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import BulkUploadModal from './components/BulkUploadModal';
import MedicineDetailsModal from './components/MedicineDetailsModal';
import MedicineFormModal from './components/MedicineFormModal';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrBj9YgXEggJuv8rbwaXT9rsxFOCpG2dvia-uP_etJLA&s";

// =========================================================================
// 4. MAIN MEDICINE MANAGEMENT PAGE
// =========================================================================
export default function MedicineManagementPage() {
    // --- Data Listings ---
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // --- Search & Pagination States ---
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // --- Modal Configuration Toggles ---
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState(null);
    const [formModalState, setFormModalState] = useState({ isOpen: false, editId: null });

    // --- Delete Confirmation State ---
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // --- Unified Fetch Router (Handles Standard List vs Elastic Search Index) ---
    const fetchMedicinesData = async () => {
        setLoading(true);
        try {
            let response;
            if (searchQuery.trim()) {
                const searchPayload = {
                    search: searchQuery.trim(),
                    page: currentPage
                };
                response = await AdminAPI.searchMedicines(searchPayload);
                if (response && response.success) {
                    setMedicines(response.data || []);
                    setTotalPages(response.totalPages || 1);
                    setTotalItems(response.totalResults || 0);
                }
            } else {
                const params = {
                    page: currentPage
                };
                response = await AdminAPI.getMedicinesList(params);
                if (response && response.success) {
                    setMedicines(response.data || []);
                    setTotalPages(response.totalPages || 1);
                    setTotalItems(response.totalMedicines || 0);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Could not retrieve current database records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        fetchMedicinesData();
    }, [currentPage, searchQuery]);

    const handleSearchInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            fetchMedicinesData();
        }
    };

    // --- Trigger Deletion Call ---
    const handleDeleteExecute = async () => {
        if (!deleteConfirmId) return;
        setActionLoading(true);
        try {
            const response = await AdminAPI.deleteMedicine(deleteConfirmId);
            if (response && response.success) {
                toast.success(response.message || "Record permanently removed from index.");
                setDeleteConfirmId(null);
                fetchMedicinesData();
            } else {
                toast.error("Failed to delete medicine entry.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred while deleting the record.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSuccessCallback = () => {
        setShowUploadModal(false);
        setFormModalState({ isOpen: false, editId: null });
        fetchMedicinesData();
    };

    return (
        <main className="min-h-screen py-0 px-0 sm:px-6 lg:px-0 antialiased select-none">
            <Toaster position="top-right" />

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Pill className="text-[#3d3f96]" /> Medicine Inventory
                    </h1>
                    <p className="text-slate-500 font-semibold text-xs mt-1">Manage global formulations, configure pricing records, or batch upload items using CSV sheets.</p>
                </div>
                
                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-sm text-xs font-bold transition-all cursor-pointer"
                    >
                        <Upload size={14} /> Import CSV
                    </button>
                    {/* <button
                        onClick={() => setFormModalState({ isOpen: true, editId: null })}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-4 py-2.5 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
                    >
                        <Plus size={14} /> Add Formulation
                    </button> */}
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
                            placeholder="Search by name, composition, manufacturer, use... (Press Enter)"
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
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling Database Tables...</p>
                </div>
            ) : medicines.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1000px] table-auto align-middle">
                            <thead>
                                <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-center px-6 py-4 w-16">S No.</th>
                                    <th className="text-center px-6 py-4 w-24">Photo</th>
                                    <th className="text-left px-6 py-4">Medicine Name</th>
                                    <th className="text-left px-6 py-4">Composition & Manufacturer</th>
                                    <th className="text-left px-6 py-4 w-44">Retail & Best Price</th>
                                    <th className="text-center px-6 py-4 w-24">Rx Req.</th>
                                    <th className="text-center px-6 py-4 w-24">For Sale</th>
                                    <th className="text-center px-6 py-4 w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {medicines.map((med, index) => (
                                    <tr key={med._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                                        
                                        {/* S No. */}
                                        <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                                            {String((currentPage - 1) * 20 + index + 1).padStart(2, "0")}
                                        </td>

                                        {/* Image */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm">
                                                <img
                                                    src={PLACEHOLDER_IMAGE}
                                                    alt={med.name}
                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>

                                        {/* Identity */}
                                        <td className="px-6 py-4">
                                            <h3 className="font-bold text-slate-800 tracking-tight leading-tight max-w-[200px] truncate" title={med.name}>
                                                {med.name}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1.5 select-all">
                                                ID: {med.Id}
                                            </p>
                                        </td>

                                        {/* Composition details */}
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="text-xs text-[#3d3f96] font-bold truncate max-w-[250px]" title={med.salt_composition}>
                                                {med.salt_composition || "Generic formula unlisted"}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]" title={med.manufacturers}>
                                                {med.manufacturers || "Apex Laboratories"}
                                            </div>
                                        </td>

                                        {/* Pricing block */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-slate-700 font-extrabold">₹ {med.best_price}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold line-through">MRP: ₹ {med.mrp}</span>
                                            </div>
                                        </td>

                                        {/* Prescription Badge */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                                med.prescription_required === 'Yes' 
                                                    ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                                {med.prescription_required || "No"}
                                            </span>
                                        </td>

                                        {/* Sale Active Badge */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                                med.for_sale === 'Yes' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                                {med.for_sale || "No"}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setSelectedDetailId(med._id)}
                                                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all"
                                                    title="Inspect Product Detail"
                                                >
                                                    <Eye size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setFormModalState({ isOpen: true, editId: med._id })}
                                                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#3d3f96] text-slate-600 border border-slate-200/60 transition-all"
                                                    title="Modify formulation"
                                                >
                                                    <Edit3 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(med._id)}
                                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100/50 transition-all"
                                                    title="Delete record"
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
                    <Pill size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold px-4">No formulations matched your query parameters.</p>
                </div>
            )}

            {/* --- PAGINATION WRAPPER --- */}
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1 || loading}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-500">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages || loading}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* --- SUBCOMPONENTS CALLING WRAPPER --- */}
            
            {/* CSV Import */}
            <BulkUploadModal 
                isOpen={showUploadModal} 
                onClose={() => setShowUploadModal(false)} 
                onSuccess={handleSuccessCallback} 
            />

            {/* Get Detail Inspect View */}
            <MedicineDetailsModal 
                medicineId={selectedDetailId} 
                onClose={() => setSelectedDetailId(null)} 
            />

            {/* Create & Update View */}
            <MedicineFormModal 
                isOpen={formModalState.isOpen} 
                editId={formModalState.editId} 
                onClose={() => setFormModalState({ isOpen: false, editId: null })} 
                onSuccess={handleSuccessCallback} 
            />

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
                    
                    <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Remove Product Record</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            Are you sure you want to permanently delete this medicine entry from the pharmacy catalog? This action is irreversible.
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