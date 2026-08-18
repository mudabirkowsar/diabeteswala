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

// Import your API service functions
import AdminAPI from '../../../../../services/AdminAPI';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1607619056574-7b8d304a2c07?q=80&w=150";

function MedicineFormModal({ isOpen, editId, onClose, onSuccess }) {
    const [actionLoading, setActionLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bread_crumb: '',
        manufacturers: '',
        salt_composition: '',
        packaging: '',
        mrp: '',
        best_price: '',
        discont_percent: '',
        prescription_required: 'No',
        image_url: '',
        primary_use: '',
        description: '',
        for_sale: 'Yes'
    });

    useEffect(() => {
        if (!isOpen) return;
        if (editId) {
            const loadFields = async () => {
                setFetching(true);
                try {
                    const response = await AdminAPI.getMedicineDetails(editId);
                    if (response && response.success) {
                        const m = response.data;
                        setFormData({
                            name: m.name || '',
                            bread_crumb: m.bread_crumb || '',
                            manufacturers: m.manufacturers || '',
                            salt_composition: m.salt_composition || '',
                            packaging: m.packaging || '',
                            mrp: m.mrp || '',
                            best_price: m.best_price || '',
                            discont_percent: m.discont_percent || '',
                            prescription_required: m.prescription_required || 'No',
                            image_url: Array.isArray(m.image_url) ? m.image_url.join(', ') : m.image_url || '',
                            primary_use: m.primary_use || '',
                            description: m.description || '',
                            for_sale: m.for_sale || 'Yes'
                        });
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to load medicine values.");
                } finally {
                    setFetching(false);
                }
            };
            loadFields();
        } else {
            // Reset to default empty on Create
            setFormData({
                name: '',
                bread_crumb: '',
                manufacturers: '',
                salt_composition: '',
                packaging: '',
                mrp: '',
                best_price: '',
                discont_percent: '',
                prescription_required: 'No',
                image_url: '',
                primary_use: '',
                description: '',
                for_sale: 'Yes'
            });
        }
    }, [isOpen, editId]);

    if (!isOpen) return null;

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Medicine name is required.");
            return;
        }

        setActionLoading(true);
        try {
            const payload = {
                ...formData,
                mrp: String(formData.mrp),
                best_price: String(formData.best_price)
            };

            let response;
            if (editId) {
                response = await AdminAPI.updateMedicine(editId, payload);
            } else {
                response = await AdminAPI.createMedicine(payload);
            }

            if (response && response.success) {
                toast.success(editId ? "Medicine updated successfully." : "Medicine created successfully.");
                onSuccess();
            } else {
                toast.error("Failed to submit medicine database updates.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred while saving the medicine record.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all">
                    <X size={18} />
                </button>

                <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6">
                    {editId ? "Edit Product Settings" : "Configure New Medicine Sheet"}
                </h2>

                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={32} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prepopulating properties...</p>
                    </div>
                ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Medicine Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                    placeholder="e.g. Paracetamol 650mg"
                                />
                            </div>

                            {/* Manufacturer */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Manufacturers</label>
                                <input
                                    type="text"
                                    value={formData.manufacturers}
                                    onChange={(e) => setFormData({...formData, manufacturers: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                    placeholder="e.g. Apex Laboratories"
                                />
                            </div>
                        </div>

                        {/* Breadcrumbs Category */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Category Tree Path (Breadcrumb)</label>
                            <input
                                type="text"
                                value={formData.bread_crumb}
                                onChange={(e) => setFormData({...formData, bread_crumb: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                placeholder="Home > OTC > Pain Relievers"
                            />
                        </div>

                        {/* Salt Composition */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Chemical Salt Composition</label>
                            <input
                                type="text"
                                value={formData.salt_composition}
                                onChange={(e) => setFormData({...formData, salt_composition: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                placeholder="e.g. Paracetamol (650mg)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Packaging */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Packaging Format</label>
                                <input
                                    type="text"
                                    value={formData.packaging}
                                    onChange={(e) => setFormData({...formData, packaging: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                    placeholder="e.g. Strip of 15 tablets"
                                />
                            </div>

                            {/* Primary Use */}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Intended Use</label>
                                <input
                                    type="text"
                                    value={formData.primary_use}
                                    onChange={(e) => setFormData({...formData, primary_use: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                    placeholder="e.g. Pain relief and Fever"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* MRP */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Retail Price (MRP)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.mrp}
                                    onChange={(e) => setFormData({...formData, mrp: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                    placeholder="30.00"
                                />
                            </div>

                            {/* Best Price */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Best Offer Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.best_price}
                                    onChange={(e) => setFormData({...formData, best_price: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                    placeholder="25.50"
                                />
                            </div>

                            {/* Discount Percent */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Discount Percent</label>
                                <input
                                    type="text"
                                    value={formData.discont_percent}
                                    onChange={(e) => setFormData({...formData, discont_percent: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                    placeholder="e.g. 15%"
                                />
                            </div>
                        </div>

                        {/* Image URL String */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Image URLs (Comma Separated)</label>
                            <input
                                type="text"
                                value={formData.image_url}
                                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Prescription Required */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Requires Prescription (Rx)</label>
                                <select
                                    value={formData.prescription_required}
                                    onChange={(e) => setFormData({...formData, prescription_required: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>

                            {/* For Sale */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Active Status for Sale</label>
                                <select
                                    value={formData.for_sale}
                                    onChange={(e) => setFormData({...formData, for_sale: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer"
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Comprehensive Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all resize-none"
                                placeholder="Identify specifications, interactions, or secondary effects..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                            >
                                {actionLoading ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <span>{editId ? "Update Product" : "Save Record"}</span>
                                )}
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
}

export default MedicineFormModal
