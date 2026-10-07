"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    ToggleLeft,
    ToggleRight,
    Package,
    IndianRupee,
    UserCheck,
    UploadCloud,
    X,
    Loader2,
    RefreshCw,
    Sparkles,
    Calendar,
    Image as ImageIcon,
    AlertTriangle,
    CheckCircle2,
    Stethoscope,
    ShieldCheck,
    Clock
} from 'lucide-react';
import AdminAPI from '../../../../services/AdminAPI'; // Adjust this import path according to your project structure

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const getMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return '/placeholder-device.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function CgmAddonsAndCoachPage() {
    // Active Tab: 'addons' | 'coach-charges'
    const [activeTab, setActiveTab] = useState('addons');

    // Data States
    const [addons, setAddons] = useState([]);
    const [coachCharges, setCoachCharges] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'

    // Modal Control States
    const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
    const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Item Context States
    const [selectedItem, setSelectedItem] = useState(null);
    const [deleteType, setDeleteType] = useState('addon'); // 'addon' | 'coach'
    const [viewType, setViewType] = useState('addon'); // 'addon' | 'coach'
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    // Form States - Addons
    const [addonFormData, setAddonFormData] = useState({
        name: '',
        price: '',
        description: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Form States - Coach Charges
    const [coachFormData, setCoachFormData] = useState({
        coachCharge: '',
        description: '',
    });

    // Feedback Toast State
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    };

    // ==========================================
    // DATA FETCHING
    // ==========================================
    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [addonsRes, coachRes] = await Promise.allSettled([
                AdminAPI.getAllCgmAddons(),
                AdminAPI.getAllCgmCoachCharges()
            ]);

            if (addonsRes.status === 'fulfilled' && addonsRes.value?.success) {
                setAddons(addonsRes.value.data || []);
            }
            if (coachRes.status === 'fulfilled' && coachRes.value?.success) {
                setCoachCharges(coachRes.value.data || []);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            showFeedback('error', 'Failed to fetch device add-ons or coach charges.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // ==========================================
    // ADDON HANDLERS
    // ==========================================
    const handleOpenCreateAddon = () => {
        setIsEditing(false);
        setSelectedItem(null);
        setAddonFormData({ name: '', price: '', description: '' });
        setImageFile(null);
        setImagePreview(null);
        setIsAddonModalOpen(true);
    };

    const handleOpenEditAddon = (addon) => {
        setIsEditing(true);
        setSelectedItem(addon);
        setAddonFormData({
            name: addon.name || '',
            price: addon.price || '',
            description: addon.description || '',
        });
        setImageFile(null);
        setImagePreview(addon.imageUrl ? getMediaUrl(addon.imageUrl) : null);
        setIsAddonModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showFeedback('error', 'Image size must be less than 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddonSubmit = async (e) => {
        e.preventDefault();
        if (!addonFormData.name.trim() || addonFormData.price === '') {
            showFeedback('error', 'Add-on name and price are required.');
            return;
        }

        try {
            setSubmitting(true);
            const data = new FormData();
            data.append('name', addonFormData.name.trim());
            data.append('price', Number(addonFormData.price));
            data.append('description', addonFormData.description.trim());

            if (imageFile) {
                data.append('imageUrl', imageFile);
            }

            if (isEditing && selectedItem) {
                const res = await AdminAPI.updateCgmAddon(selectedItem._id, data);
                if (res?.success) {
                    showFeedback('success', res.message || 'Add-on updated successfully!');
                    setIsAddonModalOpen(false);
                    fetchAllData();
                }
            } else {
                const res = await AdminAPI.createCgmAddon(data);
                if (res?.success) {
                    showFeedback('success', res.message || 'Add-on created successfully!');
                    setIsAddonModalOpen(false);
                    fetchAllData();
                }
            }
        } catch (error) {
            console.error('Addon Submit Error:', error);
            showFeedback('error', error.response?.data?.message || 'Operation failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleAddonStatus = async (id) => {
        try {
            setTogglingId(id);
            const res = await AdminAPI.toggleCgmAddonStatus(id);
            if (res?.success) {
                setAddons(prev =>
                    prev.map(item =>
                        item._id === id
                            ? { ...item, isActive: res.isActive !== undefined ? res.isActive : !item.isActive }
                            : item
                    )
                );
                showFeedback('success', res.message || 'Add-on status updated!');
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            showFeedback('error', error.response?.data?.message || 'Failed to toggle status.');
        } finally {
            setTogglingId(null);
        }
    };

    // ==========================================
    // COACH CHARGES HANDLERS
    // ==========================================
    const handleOpenCreateCoach = () => {
        setIsEditing(false);
        setSelectedItem(null);
        setCoachFormData({ coachCharge: '', description: '' });
        setIsCoachModalOpen(true);
    };

    const handleOpenEditCoach = (coach) => {
        setIsEditing(true);
        setSelectedItem(coach);
        setCoachFormData({
            coachCharge: coach.coachCharge || '',
            description: coach.description || '',
        });
        setIsCoachModalOpen(true);
    };

    const handleCoachSubmit = async (e) => {
        e.preventDefault();
        if (coachFormData.coachCharge === '') {
            showFeedback('error', 'Coach charge amount is required.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                coachCharge: Number(coachFormData.coachCharge),
                description: coachFormData.description.trim(),
            };

            if (isEditing && selectedItem) {
                const res = await AdminAPI.updateCgmCoachCharge(selectedItem._id, payload);
                if (res?.success) {
                    showFeedback('success', res.message || 'Coach charge updated successfully!');
                    setIsCoachModalOpen(false);
                    fetchAllData();
                }
            } else {
                const res = await AdminAPI.createCgmCoachCharge(payload);
                if (res?.success) {
                    showFeedback('success', res.message || 'Coach charge created successfully!');
                    setIsCoachModalOpen(false);
                    fetchAllData();
                }
            }
        } catch (error) {
            console.error('Coach Submit Error:', error);
            showFeedback('error', error.response?.data?.message || 'Operation failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleCoachStatus = async (id) => {
        try {
            setTogglingId(id);
            const res = await AdminAPI.toggleCgmCoachChargeStatus(id);
            if (res?.success) {
                setCoachCharges(prev =>
                    prev.map(item =>
                        item._id === id
                            ? { ...item, isActive: res.isActive !== undefined ? res.isActive : !item.isActive }
                            : item
                    )
                );
                showFeedback('success', res.message || 'Coach charge status updated!');
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            showFeedback('error', error.response?.data?.message || 'Failed to toggle status.');
        } finally {
            setTogglingId(null);
        }
    };

    // ==========================================
    // VIEW & DELETE HANDLERS
    // ==========================================
    const handleOpenView = (item, type) => {
        setSelectedItem(item);
        setViewType(type);
        setIsViewModalOpen(true);
    };

    const handleOpenDelete = (item, type) => {
        setSelectedItem(item);
        setDeleteType(type);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;
        try {
            setSubmitting(true);
            if (deleteType === 'addon') {
                const res = await AdminAPI.deleteCgmAddon(selectedItem._id);
                if (res?.success) {
                    setAddons(prev => prev.filter(i => i._id !== selectedItem._id));
                    showFeedback('success', res.message || 'Add-on deleted successfully.');
                }
            } else {
                const res = await AdminAPI.deleteCgmCoachCharge(selectedItem._id);
                if (res?.success) {
                    setCoachCharges(prev => prev.filter(i => i._id !== selectedItem._id));
                    showFeedback('success', res.message || 'Coach charge deleted successfully.');
                }
            }
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Delete error:', error);
            showFeedback('error', error.response?.data?.message || 'Failed to delete item.');
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // FILTERED LISTS & METRICS
    // ==========================================
    const filteredAddons = useMemo(() => {
        return addons.filter(item => {
            const matchesSearch =
                item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase());
            if (filterStatus === 'active') return matchesSearch && item.isActive;
            if (filterStatus === 'inactive') return matchesSearch && !item.isActive;
            return matchesSearch;
        });
    }, [addons, searchQuery, filterStatus]);

    const filteredCoachCharges = useMemo(() => {
        return coachCharges.filter(item => {
            const matchesSearch =
                String(item.coachCharge).includes(searchQuery) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase());
            if (filterStatus === 'active') return matchesSearch && item.isActive;
            if (filterStatus === 'inactive') return matchesSearch && !item.isActive;
            return matchesSearch;
        });
    }, [coachCharges, searchQuery, filterStatus]);

    return (
        <div className="min-h-screen bg-slate-50/60 p-4 sm:p-8 space-y-7 font-sans text-slate-900">

            {/* Toast Feedback Notification */}
            {feedback.message && (
                <div
                    className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300 ${feedback.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                >
                    {feedback.type === 'success' ? (
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    ) : (
                        <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                    )}
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* Main Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Package className="text-indigo-600" size={28} />
                        CGM Device Add-ons & Coach Charges
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                        Manage physical accessories (patches, wipes) and 1-on-1 Certified Diabetes Coach consultation charges.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={fetchAllData}
                        disabled={loading}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition cursor-pointer disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>

                    {activeTab === 'addons' ? (
                        <button
                            onClick={handleOpenCreateAddon}
                            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition cursor-pointer"
                        >
                            <Plus size={18} />
                            <span>Add New Device Add-on</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleOpenCreateCoach}
                            className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-purple-200 transition cursor-pointer"
                        >
                            <Plus size={18} />
                            <span>Add Coach Charge Plan</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 border-b border-slate-200/80 pb-px">
                <button
                    onClick={() => {
                        setActiveTab('addons');
                        setSearchQuery('');
                    }}
                    className={`flex items-center gap-2.5 px-6 py-3.5 font-black text-xs sm:text-sm rounded-t-2xl border-b-2 transition cursor-pointer ${activeTab === 'addons'
                            ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <Package size={17} />
                    <span>Physical Device Add-ons ({addons.length})</span>
                </button>

                <button
                    onClick={() => {
                        setActiveTab('coach-charges');
                        setSearchQuery('');
                    }}
                    className={`flex items-center gap-2.5 px-6 py-3.5 font-black text-xs sm:text-sm rounded-t-2xl border-b-2 transition cursor-pointer ${activeTab === 'coach-charges'
                            ? 'border-purple-600 text-purple-600 bg-white shadow-sm'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <Stethoscope size={17} />
                    <span>Coach Consultation Charges ({coachCharges.length})</span>
                </button>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={activeTab === 'addons' ? "Search add-ons..." : "Search coach plans..."}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {['all', 'active', 'inactive'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${filterStatus === status
                                    ? activeTab === 'addons' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-purple-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* ============================================================ */}
            {/* TAB 1: DEVICE ADD-ONS GRID                                  */}
            {/* ============================================================ */}
            {activeTab === 'addons' && (
                loading ? (
                    <div className="min-h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-100 p-12">
                        <Loader2 size={32} className="animate-spin text-indigo-600" />
                        <p className="text-xs font-bold text-slate-400">Loading Add-on Catalog...</p>
                    </div>
                ) : filteredAddons.length === 0 ? (
                    <div className="min-h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                            <Package size={28} />
                        </div>
                        <h4 className="text-base font-bold text-slate-800">No Add-ons Found</h4>
                        <p className="text-xs text-slate-400 max-w-sm">
                            {searchQuery ? 'No add-ons match your search.' : 'No device add-ons available. Click "+ Add New Device Add-on" to create one.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredAddons.map((item) => (
                            <div
                                key={item._id}
                                className={`bg-white rounded-3xl border transition-all duration-200 hover:shadow-lg flex flex-col overflow-hidden ${item.isActive ? 'border-slate-100 shadow-sm' : 'border-slate-200/80 opacity-75 bg-slate-50/50'
                                    }`}
                            >
                                <div className="p-4 pb-0 flex items-start gap-4">
                                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                                        <img
                                            src={getMediaUrl(item.imageUrl)}
                                            alt={item.name}
                                            className="w-full h-full object-contain rounded-xl"
                                        // onError={(e) => {
                                        //     e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop';
                                        // }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-1">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                            >
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </span>

                                            <button
                                                onClick={() => handleToggleAddonStatus(item._id)}
                                                disabled={togglingId === item._id}
                                                className="text-slate-400 hover:text-indigo-600 transition cursor-pointer p-1"
                                                title="Toggle Active Status"
                                            >
                                                {togglingId === item._id ? (
                                                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                                                ) : item.isActive ? (
                                                    <ToggleRight size={22} className="text-emerald-600" />
                                                ) : (
                                                    <ToggleLeft size={22} className="text-slate-300" />
                                                )}
                                            </button>
                                        </div>

                                        <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-tight">
                                            {item.name}
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3 flex-1">
                                    {item.description ? (
                                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No description provided.</p>
                                    )}

                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-black text-slate-400">Unit Price</span>
                                        <strong className="text-base font-black text-slate-900">₹{item.price}</strong>
                                    </div>
                                </div>

                                <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                        <Calendar size={11} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenView(item, 'addon')}
                                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                                            title="View Item"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEditAddon(item)}
                                            className="p-1.5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200 transition cursor-pointer"
                                            title="Edit Item"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDelete(item, 'addon')}
                                            className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-200 transition cursor-pointer"
                                            title="Delete Item"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* ============================================================ */}
            {/* TAB 2: COACH CHARGES GRID                                    */}
            {/* ============================================================ */}
            {activeTab === 'coach-charges' && (
                loading ? (
                    <div className="min-h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-100 p-12">
                        <Loader2 size={32} className="animate-spin text-purple-600" />
                        <p className="text-xs font-bold text-slate-400">Loading Coach Charge Plans...</p>
                    </div>
                ) : filteredCoachCharges.length === 0 ? (
                    <div className="min-h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400">
                            <Stethoscope size={28} />
                        </div>
                        <h4 className="text-base font-bold text-slate-800">No Coach Charges Configured</h4>
                        <p className="text-xs text-slate-400 max-w-sm">
                            {searchQuery ? 'No plans match your search.' : 'Configure certified coach onboarding session fees by clicking "+ Add Coach Charge Plan".'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCoachCharges.map((item) => (
                            <div
                                key={item._id}
                                className={`bg-white rounded-3xl border transition-all duration-200 hover:shadow-lg flex flex-col overflow-hidden ${item.isActive ? 'border-purple-100 shadow-sm' : 'border-slate-200/80 opacity-75 bg-slate-50/50'
                                    }`}
                            >
                                <div className="p-5 space-y-3 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isActive
                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}
                                        >
                                            {item.isActive ? 'Available in Checkout' : 'Disabled'}
                                        </span>

                                        <button
                                            onClick={() => handleToggleCoachStatus(item._id)}
                                            disabled={togglingId === item._id}
                                            className="text-slate-400 hover:text-purple-600 transition cursor-pointer p-1"
                                            title="Toggle Active Status"
                                        >
                                            {togglingId === item._id ? (
                                                <Loader2 size={16} className="animate-spin text-purple-600" />
                                            ) : item.isActive ? (
                                                <ToggleRight size={22} className="text-purple-600" />
                                            ) : (
                                                <ToggleLeft size={22} className="text-slate-300" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Fee Display Banner */}
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-4 rounded-2xl">
                                        <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider block">Consultation Fee</span>
                                        <div className="flex items-baseline gap-1 mt-0.5">
                                            <span className="text-2xl font-black text-purple-900">₹{item.coachCharge}</span>
                                            <span className="text-xs font-semibold text-purple-600">/ Session</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {item.description ? (
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                            {item.description}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No description provided.</p>
                                    )}
                                </div>

                                {/* Card Actions */}
                                <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                        <Calendar size={11} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenView(item, 'coach')}
                                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                                            title="View Details"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEditCoach(item)}
                                            className="p-1.5 bg-white hover:bg-purple-50 text-purple-600 rounded-lg border border-purple-200 transition cursor-pointer"
                                            title="Edit Plan"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDelete(item, 'coach')}
                                            className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-200 transition cursor-pointer"
                                            title="Delete Plan"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* ============================================================ */}
            {/* MODAL 1: CREATE / EDIT DEVICE ADD-ON                         */}
            {/* ============================================================ */}
            {isAddonModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    {isEditing ? 'Edit Device Add-on' : 'Create Device Add-on'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    {isEditing ? 'Update item details and accessory image.' : 'Add new item to checkout accessories list.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddonModalOpen(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleAddonSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                            {/* Image Upload Area */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                                    Add-on Image {isEditing && <span className="font-normal text-slate-400">(Optional replacement)</span>}
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-contain p-1 rounded-2xl"
                                            />
                                        ) : (
                                            <ImageIcon size={26} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <label
                                            htmlFor="addon-image-upload"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition text-xs border border-slate-200"
                                        >
                                            <UploadCloud size={15} />
                                            <span>{imagePreview ? 'Change Photo' : 'Upload Photo'}</span>
                                        </label>
                                        <input
                                            id="addon-image-upload"
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <p className="text-[10px] text-slate-400">
                                            Supported: .JPG, .PNG, .WEBP (Max 5MB)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                                    Add-on Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={addonFormData.name}
                                    onChange={(e) => setAddonFormData({ ...addonFormData, name: e.target.value })}
                                    placeholder="e.g. Waterproof Sensor Adhesive Patches (Pack of 20)"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            {/* Price Input */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                                    Price in ₹ <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={addonFormData.price}
                                        onChange={(e) => setAddonFormData({ ...addonFormData, price: e.target.value })}
                                        placeholder="299"
                                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Description Input */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                                    Description <span className="font-normal text-slate-400">(Optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={addonFormData.description}
                                    onChange={(e) => setAddonFormData({ ...addonFormData, description: e.target.value })}
                                    placeholder="Updated medical-grade waterproof patches with extra strong hypoallergenic skin-safe adhesive..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsAddonModalOpen(false)}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition cursor-pointer disabled:opacity-50"
                                >
                                    {submitting && <Loader2 size={14} className="animate-spin" />}
                                    <span>{isEditing ? 'Save Changes' : 'Create Add-on'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODAL 2: CREATE / EDIT COACH CHARGE                          */}
            {/* ============================================================ */}
            {isCoachModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    {isEditing ? 'Edit Coach Consultation Charge' : 'Add Coach Consultation Charge'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    {isEditing ? 'Update coach consultation fee and session inclusions.' : 'Set up 1-on-1 certified diabetes coach charges.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCoachModalOpen(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCoachSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                            {/* Coach Charge Input */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                                    Coach / Consultation Charge (₹) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={coachFormData.coachCharge}
                                        onChange={(e) => setCoachFormData({ ...coachFormData, coachCharge: e.target.value })}
                                        placeholder="299"
                                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Description Input */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                                    Session Details & Description <span className="font-normal text-slate-400">(Optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={coachFormData.description}
                                    onChange={(e) => setCoachFormData({ ...coachFormData, description: e.target.value })}
                                    placeholder="1-on-1 Certified Diabetes Coach consultation, live sensor onboarding, and diet trend analysis..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsCoachModalOpen(false)}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-200 transition cursor-pointer disabled:opacity-50"
                                >
                                    {submitting && <Loader2 size={14} className="animate-spin" />}
                                    <span>{isEditing ? 'Save Changes' : 'Save Coach Charge'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODAL 3: VIEW DETAILS (SHARED)                              */}
            {/* ============================================================ */}
            {isViewModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                            <h3 className="text-base font-black text-slate-900">
                                {viewType === 'addon' ? 'Device Add-on Details' : 'Coach Charge Details'}
                            </h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                            {viewType === 'addon' ? (
                                <>
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center p-1">
                                            <img
                                                src={getMediaUrl(selectedItem.imageUrl)}
                                                alt={selectedItem.name}
                                                className="w-full h-full object-contain rounded-xl"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop';
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedItem.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                            >
                                                {selectedItem.isActive ? 'Active in checkout' : 'Inactive'}
                                            </span>
                                            <h4 className="text-base font-black text-slate-900 leading-tight">
                                                {selectedItem.name}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-black text-slate-400">Unit Price</span>
                                        <strong className="text-xl font-black text-slate-900">₹{selectedItem.price}</strong>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 space-y-1">
                                    <span className="text-[10px] uppercase font-black text-purple-700">Coach Charge Rate</span>
                                    <strong className="text-2xl font-black text-purple-900 block">₹{selectedItem.coachCharge} / Session</strong>
                                </div>
                            )}

                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Description</span>
                                <p className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                                    {selectedItem.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-400">
                                <p><strong>ID:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">{selectedItem._id}</code></p>
                                <p><strong>Created:</strong> {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer transition text-xs"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODAL 4: DELETE CONFIRMATION (SHARED)                       */}
            {/* ============================================================ */}
            {isDeleteModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                            <Trash2 size={26} />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-900">
                                {deleteType === 'addon' ? 'Delete Device Add-on?' : 'Delete Coach Charge Plan?'}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Are you sure you want to permanently delete{' '}
                                <strong className="text-slate-800 font-bold">
                                    "{deleteType === 'addon' ? selectedItem.name : `₹${selectedItem.coachCharge} Plan`}"
                                </strong>? This action cannot be undone.
                            </p>
                        </div>

                        <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={submitting}
                                className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 transition cursor-pointer text-xs disabled:opacity-50"
                            >
                                {submitting && <Loader2 size={14} className="animate-spin" />}
                                <span>Yes, Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}