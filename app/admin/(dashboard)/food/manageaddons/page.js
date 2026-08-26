"use client";

import React, { useState, useEffect } from 'react';
import {
    Pencil,
    Trash2,
    Loader2,
    X,
    Package,
    Utensils,
    PlusCircle,
    Image
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import Admin API service functions
import AdminAPI from '../../../../services/AdminAPI'; // Adjust relative path based on folder depth

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function ManageAddonsPage() {
    // --- Data & Loading States ---
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // --- Modal Configuration States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editingId, setEditingId] = useState(null);

    // --- Form States ---
    const [formName, setFormName] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [imageFile, setImageFile] = useState(null); // File object for dynamic upload
    const [imageFileName, setImageFileName] = useState('No file chosen');

    // --- Helper to build full Image URL ---
    const getAddonImageUrl = (path) => {
        if (!path) return PLACEHOLDER_IMAGE;
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        const cleanBase = BACKEND_URL.replace(/\/+$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanBase}${cleanPath}`;
    };

    // --- Fetch All Available Add-ons ---
    const fetchAddonsList = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getAvailableAddons();
            if (response && response.success) {
                setAddons(response.data || []);
            }
        } catch (err) {
            console.error("Error fetching available add-ons:", err);
            toast.error("Failed to load active non-food indexes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddonsList();
    }, []);

    // --- Open Modal for Creation ---
    const openCreateModal = () => {
        setModalMode('create');
        setEditingId(null);
        setFormName('');
        setFormPrice('');
        setFormDescription('');
        setImageFile(null);
        setImageFileName('No file chosen');
        setIsModalOpen(true);
    };

    // --- Open Modal for Editing ---
    const openEditModal = (addon) => {
        setModalMode('edit');
        setEditingId(addon._id);
        setFormName(addon.name || '');
        setFormPrice(addon.price?.toString() || '');
        setFormDescription(addon.description || '');
        setImageFile(null); // Clear selected local file, preserve existing remote file
        setImageFileName(addon.imageUrl ? "Current Image Preserved" : "No file chosen");
        setIsModalOpen(true);
    };

    // --- Handle Creation or Update Submission ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        // Construct FormData payload for dynamic file upload
        const formData = new FormData();
        formData.append('name', formName.trim());
        formData.append('price', parseFloat(formPrice) || 0);
        formData.append('description', formDescription.trim());

        if (imageFile) {
            formData.append('imageUrl', imageFile); // Matches the 'imageUrl' parameter from API spec
        }

        try {
            if (modalMode === 'create') {
                const response = await AdminAPI.createAddon(formData);
                if (response && response.success) {
                    toast.success(response.message || "Add-on created successfully!");
                    setIsModalOpen(false);
                    fetchAddonsList();
                }
            } else {
                const response = await AdminAPI.updateAddonDetails(editingId, formData);
                if (response && response.success) {
                    toast.success(response.message || "Add-on updated successfully!");
                    setIsModalOpen(false);
                    fetchAddonsList();
                }
            }
        } catch (err) {
            console.error("Error submitting add-on data:", err);
            toast.error(err.response?.data?.message || "Failed to submit accessory specifications.");
        } finally {
            setProcessing(false);
        }
    };

    // --- Handle Delete Operation ---
    const handleDeleteAddon = async (id, name) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
        try {
            const response = await AdminAPI.deleteAddon(id);
            if (response && response.success) {
                toast.success(response.message || "Add-on removed successfully.");
                fetchAddonsList();
            }
        } catch (err) {
            console.error("Error deleting accessory:", err);
            toast.error(err.response?.data?.message || "Failed to remove accessory.");
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 py-4 pb-12 antialiased select-none text-left">
            <Toaster position="top-right" />

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 flex-shrink-0 shadow-sm">
                        <Package className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Non-Food Add-ons</h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">Configure cutleries, reusable containers, and premium delivery packaging accessories.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition active:scale-95"
                    >
                        <PlusCircle size={15} className="stroke-[2.5]" />
                        CREATE NEW ADD-ON
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retrieving accessories database...</p>
                </div>
            ) : addons.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <Utensils size={44} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Active Accessories Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        You haven't listed any non-food accessories or cutleries yet. Click on "Create New Add-on" to list your first item.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-5 px-6">Accessory Name</th>
                                    <th className="py-5 px-6">Description Overview</th>
                                    <th className="py-5 px-6">Base Unit Price</th>
                                    <th className="py-5 px-6">Created On</th>
                                    <th className="py-5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {addons.map((addon) => {
                                    const dateFormatted = new Date(addon.createdAt).toLocaleDateString("en-US", {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    });

                                    return (
                                        <tr key={addon._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                        <img
                                                            src={getAddonImageUrl(addon.imageUrl)}
                                                            alt={addon.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-[13px] leading-snug">{addon.name}</p>
                                                        <p className="text-[9px] font-extrabold text-slate-400 uppercase mt-1">ID: {addon._id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-slate-500 font-medium leading-relaxed max-w-[300px] truncate" title={addon.description}>
                                                    {addon.description || "No descriptive monograph configured."}
                                                </p>
                                            </td>
                                            <td className="py-5 px-6 font-mono font-bold text-slate-800 text-sm">
                                                ₹{addon.price}
                                            </td>
                                            <td className="py-5 px-6 text-slate-400 font-bold">
                                                {dateFormatted}
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(addon)}
                                                        className="p-1.5 border border-slate-200 text-slate-400 hover:text-[#3d3f96] hover:bg-[#3d3f96]/5 rounded-lg transition cursor-pointer"
                                                        title="Edit details"
                                                    >
                                                        <Pencil className="w-4 h-4" strokeWidth={2} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddon(addon._id, addon.name)}
                                                        className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                        title="Delete permanently"
                                                    >
                                                        <Trash2 className="w-4 h-4" strokeWidth={2} />
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
            )}

            {/* --- CREATE / EDIT OVERLAY MODAL SHEET --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up flex flex-col">

                        {/* Close Trigger */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-6">

                            {/* Modal Title Header */}
                            <div className="border-b border-slate-50 pb-4">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <Package size={18} className="text-[#3d3f96]" />
                                    {modalMode === 'create' ? 'Create New Accessory' : 'Modify Accessory Details'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Configure name, pricing, and descriptors for checkout billing items.</p>
                            </div>

                            {/* Form Input fields */}
                            <form onSubmit={handleFormSubmit} className="space-y-4">

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accessory Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="e.g. Eco-friendly Wooden Spoon & Fork Set"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit Price (₹) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formPrice}
                                            onChange={(e) => setFormPrice(e.target.value)}
                                            placeholder="e.g. 10"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                        />
                                    </div>

                                    {/* Dynamic Image File Picker */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add-on Image File</label>
                                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3 h-[42px]">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                                    <Image size={13} strokeWidth={1.8} />
                                                </div>
                                                <span className="text-[11px] text-slate-500 truncate max-w-[140px]" title={imageFileName}>
                                                    {imageFileName}
                                                </span>
                                            </div>
                                            <label className="cursor-pointer bg-[#00B574] hover:bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-wide px-3 py-1.5 rounded-lg transition shrink-0 select-none">
                                                Choose File
                                                <input
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setImageFile(file);
                                                            setImageFileName(file.name);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monograph Descriptor</label>
                                    <textarea
                                        rows={3}
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        placeholder="Enter structural properties or packaging specifications..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Modal Actions Footer */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-7 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        {processing ? <Loader2 size={13} className="animate-spin text-white" /> : null}
                                        <span>{modalMode === 'create' ? 'Create Addon' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}