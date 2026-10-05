"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Activity,
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    CheckCircle2,
    Ban,
    Clock,
    X,
    Check,
    Loader2,
    Layers,
    Sparkles,
    ShieldCheck,
    AlertCircle,
    Calendar,
    FolderPlus,
    Tag
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import AdminAPI service (adjust relative path if needed)
import AdminAPI from '../../../../services/AdminAPI';

export default function DeviceCategoryPage() {
    // --- Data & Loading States ---
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    // --- Search & Filter States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

    // --- Create / Edit Modal States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    // --- Delete Prompt State ---
    const [deleteTarget, setDeleteTarget] = useState(null);

    // --- 1. Fetch All CGM Device Categories ---
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getAllCgmCategories();
            if (response && response.success) {
                setCategories(response.data || []);
            } else {
                toast.error(response?.message || 'Failed to load device categories.');
            }
        } catch (err) {
            console.error('Error fetching device categories:', err);
            toast.error(err.response?.data?.message || 'Error connecting to categories service.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // --- 2. Open Create Modal ---
    const handleOpenCreateModal = () => {
        setModalMode('create');
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setIsModalOpen(true);
    };

    // --- 3. Open Edit Modal ---
    const handleOpenEditModal = (category) => {
        setModalMode('edit');
        setEditingCategory(category);
        setFormData({
            name: category.name || '',
            description: category.description || ''
        });
        setIsModalOpen(true);
    };

    // --- 4. Submit Create or Update ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Category name is required.');
            return;
        }

        setActionLoading(true);
        try {
            let response;
            if (modalMode === 'create') {
                response = await AdminAPI.createCgmCategory({
                    name: formData.name.trim(),
                    description: formData.description.trim()
                });
            } else {
                response = await AdminAPI.updateCgmCategory(editingCategory._id, {
                    name: formData.name.trim(),
                    description: formData.description.trim()
                });
            }

            if (response && response.success) {
                toast.success(response.message || (modalMode === 'create' ? 'Category created successfully!' : 'Category updated successfully!'));
                setIsModalOpen(false);
                setEditingCategory(null);
                setFormData({ name: '', description: '' });
                fetchCategories();
            } else {
                toast.error(response?.message || 'Failed to save category.');
            }
        } catch (err) {
            console.error('Error submitting category:', err);
            toast.error(err.response?.data?.message || 'Server error processing request.');
        } finally {
            setActionLoading(false);
        }
    };

    // --- 5. Toggle Category Status ---
    const handleToggleStatus = async (category) => {
        setTogglingId(category._id);
        try {
            const response = await AdminAPI.toggleCgmCategoryStatus(category._id);
            if (response && response.success) {
                toast.success(response.message || 'Category status updated.');
                // Update locally for instantaneous UI feedback
                setCategories((prev) =>
                    prev.map((item) =>
                        item._id === category._id
                            ? { ...item, isActive: response.data?.isActive !== undefined ? response.data.isActive : !item.isActive }
                            : item
                    )
                );
            } else {
                toast.error(response?.message || 'Failed to toggle status.');
            }
        } catch (err) {
            console.error('Error toggling category status:', err);
            toast.error(err.response?.data?.message || 'Failed to toggle category status.');
        } finally {
            setTogglingId(null);
        }
    };

    // --- 6. Delete Category ---
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setActionLoading(true);
        try {
            const response = await AdminAPI.deleteCgmCategory(deleteTarget._id);
            if (response && response.success) {
                toast.success(response.message || 'Category deleted successfully.');
                setCategories((prev) => prev.filter((item) => item._id !== deleteTarget._id));
                setDeleteTarget(null);
            } else {
                toast.error(response?.message || 'Failed to delete category.');
            }
        } catch (err) {
            console.error('Error deleting category:', err);
            toast.error(err.response?.data?.message || 'Failed to delete category.');
        } finally {
            setActionLoading(false);
        }
    };

    // --- Filtering Logic ---
    const filteredCategories = categories.filter((item) => {
        const matchesSearch =
            (item.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            (item.description || '').toLowerCase().includes(searchQuery.toLowerCase().trim());

        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && item.isActive) ||
            (statusFilter === 'INACTIVE' && !item.isActive);

        return matchesSearch && matchesStatus;
    });

    // Metric Counts
    const totalCount = categories.length;
    const activeCount = categories.filter((c) => c.isActive).length;
    const inactiveCount = categories.filter((c) => !c.isActive).length;

    return (
        <div className="max-w-[1600px] mx-auto space-y-7 py-4 pb-20 antialiased select-none text-left">
            <Toaster position="top-right" />

            {/* --- TOP HEADER SECTION --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/20 shadow-xs shrink-0">
                        <Activity className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                CGM Device Categories
                            </h1>
                            <span className="text-[11px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full shadow-2xs">
                                Master Catalogue
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                            Configure continuous glucose monitoring device categories, glucometers, sensors, and diabetic health kits.
                        </p>
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={fetchCategories}
                        disabled={loading}
                        className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        title="Refresh category catalog"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin text-[#3d3f96]' : ''} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={handleOpenCreateModal}
                        className="px-6 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-950/15 transition flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            {/* --- STAT METRIC CARDS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
                        <Layers size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Total Categories</span>
                        <h3 className="text-2xl font-black text-slate-900">{totalCount}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Active in Catalog</span>
                        <h3 className="text-2xl font-black text-emerald-600">{activeCount}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                        <Ban size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Inactive Categories</span>
                        <h3 className="text-2xl font-black text-rose-600">{inactiveCount}</h3>
                    </div>
                </div>
            </div>

            {/* --- FILTER & SEARCH BAR --- */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search category by name or description..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    {[
                        { id: 'ALL', label: 'All Categories' },
                        { id: 'ACTIVE', label: 'Active Only' },
                        { id: 'INACTIVE', label: 'Inactive Only' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                                statusFilter === tab.id
                                    ? 'bg-white text-[#3d3f96] shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CATEGORIES TABLE LEDGER --- */}
            {loading ? (
                <div className="py-28 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Scanning device category master catalogue...
                    </p>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-xs flex flex-col items-center justify-center text-center p-6">
                    <Tag size={48} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Device Categories Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No categories match your search or filter criteria. Click &ldquo;Add Category&rdquo; to create a new one.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-black bg-slate-50/70 tracking-wider">
                                    <th className="py-4.5 px-6">Category Name</th>
                                    <th className="py-4.5 px-6">Description</th>
                                    <th className="py-4.5 px-6">Created / Modified</th>
                                    <th className="py-4.5 px-6">Status</th>
                                    <th className="py-4.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {filteredCategories.map((category) => (
                                    <tr
                                        key={category._id}
                                        className="hover:bg-slate-50/70 transition-colors"
                                    >
                                        {/* 1. Category Name */}
                                        <td className="py-4.5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] border border-indigo-100 flex items-center justify-center shrink-0">
                                                    <Activity size={18} />
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-black text-slate-900 block">
                                                        {category.name}
                                                    </strong>
                                                    <span className="text-[10px] font-mono text-slate-400">
                                                        ID: {category._id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 2. Description */}
                                        <td className="py-4.5 px-6 max-w-xs sm:max-w-md">
                                            <p className="text-xs text-slate-500 font-medium line-clamp-2" title={category.description}>
                                                {category.description || 'No description specified.'}
                                            </p>
                                        </td>

                                        {/* 3. Created / Modified */}
                                        <td className="py-4.5 px-6">
                                            <span className="text-[11px] font-bold text-slate-700 block">
                                                {new Date(category.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(category.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>

                                        {/* 4. Status Toggle */}
                                        <td className="py-4.5 px-6">
                                            <button
                                                disabled={togglingId === category._id}
                                                onClick={() => handleToggleStatus(category)}
                                                className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border transition cursor-pointer ${
                                                    category.isActive
                                                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                                        : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                                                }`}
                                            >
                                                {togglingId === category._id ? (
                                                    <Loader2 size={11} className="animate-spin" />
                                                ) : category.isActive ? (
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                ) : (
                                                    <Ban size={12} className="text-rose-500" />
                                                )}
                                                <span>{category.isActive ? 'Active' : 'Inactive'}</span>
                                            </button>
                                        </td>

                                        {/* 5. Actions */}
                                        <td className="py-4.5 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleOpenEditModal(category)}
                                                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition cursor-pointer"
                                                    title="Edit Category"
                                                >
                                                    <Edit3 size={14} />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => setDeleteTarget(category)}
                                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition cursor-pointer"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- CREATE / EDIT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/15 shrink-0">
                                    <FolderPlus size={20} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                                        {modalMode === 'create' ? 'Create Device Category' : 'Edit Device Category'}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                        {modalMode === 'create' ? 'Add a new group for diabetic sensors & kits' : `Updating ${editingCategory?.name}`}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            
                            {/* Category Name */}
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Category Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. CGM Device, Glucometers, Diabetic Sensors"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                />
                            </div>

                            {/* Category Description */}
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Category Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g. Continuous Glucose Monitoring Sensors and 24/7 Smart Biosensors."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white resize-none transition leading-relaxed"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                                >
                                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                                    <span>{modalMode === 'create' ? 'Create Category' : 'Save Changes'}</span>
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRMATION DIALOG --- */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl space-y-4 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                            <Trash2 size={22} />
                        </div>

                        <div>
                            <h4 className="text-base font-black text-slate-900">Delete Device Category?</h4>
                            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                Are you sure you want to delete category <strong className="text-slate-800 font-bold">&ldquo;{deleteTarget.name}&rdquo;</strong>? This action cannot be undone and will affect associated inventory items.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleConfirmDelete}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                                <span>Confirm Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
} 