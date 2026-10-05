
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Activity,
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    Eye,
    CheckCircle2,
    Ban,
    Loader2,
    Smartphone,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    Package,
    Upload,
    X,
    Leaf
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import AdminAPI from '../../../../services/AdminAPI';
import CreateProduct from './components/CreateProduct';
import ViewProduct from './components/ViewProduct';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const getMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return '/placeholder-device.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function CgmDevicesPage() {
    const [devices, setDevices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [productTypeFilter, setProductTypeFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await AdminAPI.getAllCgmCategories();
            if (response && response.success) {
                setCategories(response.data || []);
            }
        } catch (err) {
            console.error('Error loading device categories:', err);
        }
    }, []);

    const fetchDevices = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10
            };
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (selectedCategory !== 'ALL') params.categoryId = selectedCategory;

            const response = await AdminAPI.getAllCgmDevices(params);
            if (response && response.success) {
                let list = response.data || [];
                if (productTypeFilter !== 'ALL') {
                    list = list.filter((item) => (item.productType || 'Glucometer').toLowerCase() === productTypeFilter.toLowerCase());
                }
                setDevices(list);
                setTotalDocs(response.totalDocs || list.length);
                setTotalPages(response.totalPages || Math.ceil((response.totalDocs || list.length) / 10) || 1);
            }
        } catch (err) {
            console.error('Error fetching devices list:', err);
            toast.error(err.response?.data?.message || 'Failed to load devices.');
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, selectedCategory, productTypeFilter]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    const handleToggleStatus = async (device) => {
        setTogglingId(device._id);
        try {
            const response = await AdminAPI.toggleCgmDeviceStatus(device._id);
            if (response && response.success) {
                toast.success(response.message || 'Status updated.');
                setDevices((prev) =>
                    prev.map((item) =>
                        item._id === device._id
                            ? { ...item, isActive: response.data?.isActive !== undefined ? response.data.isActive : !item.isActive }
                            : item
                    )
                );
            }
        } catch (err) {
            console.error('Error toggling device status:', err);
            toast.error(err.response?.data?.message || 'Failed to toggle status.');
        } finally {
            setTogglingId(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setActionLoading(true);
        try {
            const response = await AdminAPI.deleteCgmDevice(deleteTarget._id);
            if (response && response.success) {
                toast.success(response.message || 'Device deleted permanently.');
                setDevices((prev) => prev.filter((d) => d._id !== deleteTarget._id));
                setDeleteTarget(null);
            }
        } catch (err) {
            console.error('Error deleting device:', err);
            toast.error(err.response?.data?.message || 'Failed to delete device.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) return toast.error('Please select a valid CSV or Excel file.');

        setActionLoading(true);
        try {
            const data = new FormData();
            data.append('file', importFile);

            const response = await AdminAPI.bulkImportCgmDevicesCsv(data);
            if (response && response.success) {
                toast.success(response.message || `Successfully imported ${response.importedCount || 0} devices!`);
                setIsImportModalOpen(false);
                setImportFile(null);
                fetchDevices();
            } else {
                toast.error(response?.message || 'Import failed.');
            }
        } catch (err) {
            console.error('Error importing CSV:', err);
            toast.error(err.response?.data?.message || 'Failed to process CSV file.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-7 py-4 pb-20 antialiased select-none text-left">
            <Toaster position="top-right" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/20 shadow-xs shrink-0">
                        <Smartphone className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                CGM &amp; Smart Glucometer Inventory
                            </h1>
                            <span className="text-[11px] font-black uppercase text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full shadow-2xs">
                                {totalDocs} Total Products
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                            Manage smartphone glucometers, 24/7 continuous glucose monitoring sensors, and diabetic health supplements.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <button
                        onClick={fetchDevices}
                        disabled={loading}
                        className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        title="Refresh catalog"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin text-[#3d3f96]' : ''} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                        <FileSpreadsheet size={16} />
                        <span>Bulk Import CSV</span>
                    </button>

                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setIsCreateModalOpen(true);
                        }}
                        className="px-6 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-950/15 transition flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search title, brand, or model (e.g. Curv, Sensor)..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        />
                    </div>

                    <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden w-full lg:w-auto">
                        {[
                            { id: 'ALL', label: 'All Catalog' },
                            { id: 'Glucometer', label: 'Glucometers' },
                            { id: 'CGM', label: 'CGM Sensors' },
                            { id: 'Supplement', label: 'Supplements' },
                            { id: 'Accessory', label: 'Accessories' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => { setProductTypeFilter(type.id); setPage(1); }}
                                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                                    productTypeFilter === type.id
                                        ? 'bg-white text-[#3d3f96] shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-full lg:w-56 shrink-0">
                        <select
                            value={selectedCategory}
                            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
                        >
                            <option value="ALL">All Categories</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-28 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Scanning glucose device catalog registers...
                    </p>
                </div>
            ) : devices.length === 0 ? (
                <div className="py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-xs flex flex-col items-center justify-center text-center p-6">
                    <Package size={48} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Devices In Inventory</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No products match your active search and filter criteria. Click &ldquo;Add Product&rdquo; or bulk import from CSV.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-black bg-slate-50/70 tracking-wider">
                                    <th className="py-4.5 px-6">Product Overview</th>
                                    <th className="py-4.5 px-6">Type &amp; Specs</th>
                                    <th className="py-4.5 px-6">Pricing &amp; Margin</th>
                                    <th className="py-4.5 px-6">Stock Status</th>
                                    <th className="py-4.5 px-6">Visibility</th>
                                    <th className="py-4.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {devices.map((device) => {
                                    const cat = typeof device.categoryId === 'object' ? device.categoryId : {};
                                    const catName = cat?.name || 'Device';
                                    const prodType = device.productType || 'Glucometer';

                                    return (
                                        <tr key={device._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-4.5 px-6">
                                                <div className="flex items-center gap-3.5 max-w-md">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                        <img
                                                            src={getMediaUrl(device.mainImage)}
                                                            alt={device.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=300&auto=format&fit=crop'; }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-200">
                                                                {catName}
                                                            </span>
                                                            {device.badge && (
                                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                                                    {device.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <strong className="text-xs font-black text-slate-900 block line-clamp-1" title={device.title}>
                                                            {device.title}
                                                        </strong>
                                                        <span className="text-[10px] text-slate-400 font-bold block">
                                                            {device.brand} • Model: {device.deviceModel}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4.5 px-6">
                                                {prodType === 'Supplement' ? (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <Leaf size={10} /> Supplement
                                                        </span>
                                                        <p className="text-[11px] font-bold text-slate-700">
                                                            {device.supplementDetails?.netQuantity || '60 Caps'} • {device.supplementDetails?.form || 'Capsules'}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 block truncate max-w-[170px]" title={device.supplementDetails?.dosage}>
                                                            {device.supplementDetails?.dosage || 'Dietary supplement'}
                                                        </span>
                                                    </div>
                                                ) : prodType === 'CGM' ? (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                                            <Activity size={10} /> CGM Sensor
                                                        </span>
                                                        <p className="text-[11px] font-bold text-slate-700">
                                                            {device.cgmDetails?.sensorLifeSpanDays || 14}-Day Continuous Sensor
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 block">
                                                            {device.connectorType || 'Wireless'} • Warmup: {device.cgmDetails?.sensorWarmupTime || '60 mins'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                            <Smartphone size={10} /> {device.connectorType || 'Type-C'}
                                                        </span>
                                                        <p className="text-[11px] font-bold text-slate-700">
                                                            {device.compatibility || 'Android Only'}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 block">
                                                            {device.variants?.length || 1} Strips Variant(s)
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-4.5 px-6">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-sm font-black text-slate-900">
                                                            ₹{device.sellingPrice}
                                                        </strong>
                                                        <span className="text-[11px] text-slate-400 line-through">
                                                            ₹{device.mrp}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-emerald-600 block">
                                                        Prepaid: ₹{device.prepaidDiscountPrice || device.sellingPrice}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-4.5 px-6">
                                                <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-1 rounded-xl border ${
                                                    device.stockQuantity > 10
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : device.stockQuantity > 0
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                    {device.stockQuantity} Units
                                                </span>
                                            </td>

                                            <td className="py-4.5 px-6">
                                                <button
                                                    disabled={togglingId === device._id}
                                                    onClick={() => handleToggleStatus(device)}
                                                    className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border transition cursor-pointer ${
                                                        device.isActive
                                                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                                            : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    {togglingId === device._id ? (
                                                        <Loader2 size={11} className="animate-spin" />
                                                    ) : device.isActive ? (
                                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                                    ) : (
                                                        <Ban size={12} className="text-rose-500" />
                                                    )}
                                                    <span>{device.isActive ? 'Active' : 'Inactive'}</span>
                                                </button>
                                            </td>

                                            <td className="py-4.5 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setViewingProduct(device);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                                                        title="View Specifications"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingProduct(device);
                                                            setIsCreateModalOpen(true);
                                                        }}
                                                        className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-[#3d3f96] rounded-xl transition cursor-pointer"
                                                        title="Edit Product"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(device)}
                                                        className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl transition cursor-pointer"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="py-4 px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">
                                Page {page} of {totalPages} ({totalDocs} total products)
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <CreateProduct
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingProduct(null);
                }}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    setEditingProduct(null);
                    fetchDevices();
                }}
                categories={categories}
                editData={editingProduct}
            />

            <ViewProduct
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewingProduct(null);
                }}
                device={viewingProduct}
            />

            {isImportModalOpen && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <FileSpreadsheet size={18} className="text-emerald-600" />
                                Bulk Import Products (CSV / Excel)
                            </h4>
                            <button onClick={() => setIsImportModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Upload a `.csv`, `.xlsx`, or `.xls` spreadsheet with columns matching your catalog headers (`title`, `categoryName`, `brand`, `mrp`, `sellingPrice`, `stockQuantity`, etc.).
                        </p>

                        <form onSubmit={handleBulkImportSubmit} className="space-y-4">
                            <label className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition">
                                <Upload size={24} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-700 text-center">
                                    {importFile ? importFile.name : 'Choose CSV or Excel Spreadsheet'}
                                </span>
                                <span className="text-[10px] text-slate-400">Max size 10MB</span>
                                <input
                                    type="file"
                                    required
                                    accept=".csv,.xlsx,.xls"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) setImportFile(e.target.files[0]);
                                    }}
                                    className="hidden"
                                />
                            </label>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading || !importFile}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                                    <span>Import Devices</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl space-y-4 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                            <Trash2 size={22} />
                        </div>
                        <div>
                            <h4 className="text-base font-black text-slate-900">Permanently Delete Device?</h4>
                            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                Are you sure you want to delete <strong className="text-slate-800 font-bold">&ldquo;{deleteTarget.title}&rdquo;</strong>? All uploaded media files will be deleted from server storage.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
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
                                <span>Delete Device</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}