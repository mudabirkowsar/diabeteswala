"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    X,
    Plus,
    Search,
    Edit2,
    Trash2,
    Check,
    Loader2,
    HeartPulse,
    ShieldCheck,
    IndianRupee,
    AlertCircle,
    Power,
    CheckCircle2,
    Ban,
    Sparkles,
    RefreshCw,
    Stethoscope,
    Layers
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import AdminAPI service (adjust path if needed)
import AdminAPI from '../../../../services/AdminAPI';

export default function AddSupportingStaff({ isOpen, onClose }) {
    // --- States ---
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeActionId, setActiveActionId] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [applicableForFilter, setApplicableForFilter] = useState('all'); // 'all' | 'clinic-ambulance' | 'ambulance'
    const [statusFilter, setStatusFilter] = useState(''); // '' (all), 'true', 'false'

    // Form / Modal State (Create / Edit)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        defaultPrice: 0,
        applicableFor: 'all',
        isActive: true
    });

    // Delete Confirmation Modal State
    const [deleteTarget, setDeleteTarget] = useState(null);

    // --- 1. Fetch Facility List ---
    const fetchFacilities = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (applicableForFilter !== 'all') params.applicableFor = applicableForFilter;
            if (statusFilter !== '') params.isActive = statusFilter === 'true';

            const response = await AdminAPI.getAmbulanceFacilitiesList(params);
            if (response && response.success) {
                setFacilities(response.data || []);
            } else {
                setFacilities([]);
            }
        } catch (err) {
            console.error('Error fetching facilities:', err);
            toast.error(err.response?.data?.message || 'Failed to load ambulance facilities.');
        } finally {
            setLoading(false);
        }
    }, [search, applicableForFilter, statusFilter]);

    useEffect(() => {
        if (isOpen) {
            fetchFacilities();
        }
    }, [isOpen, fetchFacilities]);

    // --- 2. Open Form (Create / Edit) ---
    const handleOpenForm = (facility = null) => {
        if (facility) {
            setEditingFacility(facility);
            setFormData({
                name: facility.name || '',
                description: facility.description || '',
                defaultPrice: facility.defaultPrice || 0,
                applicableFor: facility.applicableFor || 'all',
                isActive: facility.isActive !== undefined ? facility.isActive : true
            });
        } else {
            setEditingFacility(null);
            setFormData({
                name: '',
                description: '',
                defaultPrice: 0,
                applicableFor: 'all',
                isActive: true
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingFacility(null);
    };

    // --- 3. Submit Form (Create / Update) ---
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Facility or Staff name is required.');
            return;
        }

        setActionLoading(true);
        try {
            if (editingFacility) {
                const response = await AdminAPI.updateAmbulanceFacility(editingFacility._id, {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    defaultPrice: Number(formData.defaultPrice) || 0,
                    applicableFor: formData.applicableFor,
                    isActive: formData.isActive
                });
                if (response && response.success) {
                    toast.success(response.message || 'Facility updated successfully.');
                    handleCloseForm();
                    fetchFacilities();
                }
            } else {
                const response = await AdminAPI.createAmbulanceFacility({
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    defaultPrice: Number(formData.defaultPrice) || 0,
                    applicableFor: formData.applicableFor
                });
                if (response && response.success) {
                    toast.success(response.message || 'Facility created successfully.');
                    handleCloseForm();
                    fetchFacilities();
                }
            }
        } catch (err) {
            console.error('Error saving facility:', err);
            toast.error(err.response?.data?.message || 'Failed to save facility.');
        } finally {
            setActionLoading(false);
        }
    };

    // --- 4. Toggle Status (Active / Inactive) ---
    const handleToggleStatus = async (facility) => {
        setActiveActionId(facility._id);
        try {
            const response = await AdminAPI.toggleAmbulanceFacilityStatus(facility._id);
            if (response && response.success) {
                toast.success(response.message || `Status changed.`);
                fetchFacilities();
            }
        } catch (err) {
            console.error('Error toggling status:', err);
            toast.error(err.response?.data?.message || 'Failed to toggle status.');
        } finally {
            setActiveActionId(null);
        }
    };

    // --- 5. Delete Facility ---
    const handleDeleteFacility = async () => {
        if (!deleteTarget) return;
        setActionLoading(true);
        setActiveActionId(deleteTarget._id);
        try {
            const response = await AdminAPI.deleteAmbulanceFacility(deleteTarget._id);
            if (response && response.success) {
                toast.success(response.message || 'Facility deleted successfully.');
                setDeleteTarget(null);
                fetchFacilities();
            }
        } catch (err) {
            console.error('Error deleting facility:', err);
            toast.error(err.response?.data?.message || 'Failed to delete facility.');
        } finally {
            setActionLoading(false);
            setActiveActionId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-5 animate-in fade-in duration-200">
            <Toaster position="top-right" />
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-left overflow-hidden">
                
                {/* --- MODAL HEADER --- */}
                <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs">
                            <HeartPulse size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                                    Ambulance Facilities & Support Staff Master
                                </h3>
                                <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                    Admin Master
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Configure standardized emergency equipment, nurse/doctor support, and default addon pricing.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleOpenForm()}
                            className="px-4 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                            <Plus size={15} strokeWidth={3} />
                            <span className="hidden sm:inline">Add New Facility</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* --- TOOLBAR / FILTERS --- */}
                <div className="px-6 py-4 sm:px-8 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search facility (e.g. Doctor, Oxygen, ICU)..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={applicableForFilter}
                            onChange={(e) => setApplicableForFilter(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] transition cursor-pointer"
                        >
                            <option value="all">All Fleet Types</option>
                            <option value="ambulance">Independent Ambulances</option>
                            <option value="clinic-ambulance">Clinic Ambulances</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] transition cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Active Only</option>
                            <option value="false">Inactive Only</option>
                        </select>

                        <button
                            onClick={fetchFacilities}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                            title="Refresh List"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                {/* --- FACILITIES TABLE / CONTENT --- */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 [&::-webkit-scrollbar]:hidden">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Loading master facility catalogue...
                            </p>
                        </div>
                    ) : facilities.length === 0 ? (
                        <div className="py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6">
                            <Stethoscope size={44} className="text-slate-300 mb-2" />
                            <h4 className="text-base font-bold text-slate-700">No Facilities Registered</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">
                                No support staff or equipment match your filter criteria. Click "Add New Facility" above to create one.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 uppercase font-black bg-slate-50/70 tracking-wider">
                                            <th className="py-3.5 px-5">Facility / Staff Name</th>
                                            <th className="py-3.5 px-5">Description</th>
                                            <th className="py-3.5 px-5">Default Add-On Price</th>
                                            <th className="py-3.5 px-5">Applicable For</th>
                                            <th className="py-3.5 px-5">Status</th>
                                            <th className="py-3.5 px-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                        {facilities.map((fac) => (
                                            <tr key={fac._id} className="hover:bg-slate-50/70 transition-colors">
                                                
                                                {/* 1. Name */}
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] border border-indigo-100 flex items-center justify-center shrink-0">
                                                            <HeartPulse size={15} />
                                                        </div>
                                                        <strong className="text-sm font-black text-slate-900">
                                                            {fac.name}
                                                        </strong>
                                                    </div>
                                                </td>

                                                {/* 2. Description */}
                                                <td className="py-4 px-5 max-w-[260px]">
                                                    <p className="text-xs text-slate-500 line-clamp-2" title={fac.description}>
                                                        {fac.description || 'No description provided.'}
                                                    </p>
                                                </td>

                                                {/* 3. Default Price */}
                                                <td className="py-4 px-5">
                                                    <span className="inline-flex items-center gap-1 font-black text-slate-900 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                                                        <IndianRupee size={12} /> {fac.defaultPrice || 0}
                                                    </span>
                                                </td>

                                                {/* 4. Applicable For */}
                                                <td className="py-4 px-5">
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                                        {fac.applicableFor === 'all'
                                                            ? 'All Ambulances'
                                                            : fac.applicableFor === 'clinic-ambulance'
                                                                ? 'Clinic Only'
                                                                : 'Independent Only'}
                                                    </span>
                                                </td>

                                                {/* 5. Status Toggle Badge */}
                                                <td className="py-4 px-5">
                                                    <button
                                                        onClick={() => handleToggleStatus(fac)}
                                                        disabled={activeActionId === fac._id}
                                                        className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border transition cursor-pointer ${
                                                            fac.isActive
                                                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                                                : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                                                        }`}
                                                    >
                                                        {activeActionId === fac._id ? (
                                                            <Loader2 size={11} className="animate-spin" />
                                                        ) : fac.isActive ? (
                                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                                        ) : (
                                                            <Ban size={12} className="text-rose-500" />
                                                        )}
                                                        <span>{fac.isActive ? 'Active' : 'Inactive'}</span>
                                                    </button>
                                                </td>

                                                {/* 6. Action Buttons */}
                                                <td className="py-4 px-5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleOpenForm(fac)}
                                                            className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition cursor-pointer"
                                                            title="Edit Facility"
                                                        >
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(fac)}
                                                            className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition cursor-pointer"
                                                            title="Delete Facility"
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
                    )}
                </div>

                {/* --- MODAL FOOTER --- */}
                <div className="px-6 py-4 sm:px-8 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0">
                    <span>Total Facilities: {facilities.length}</span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black uppercase text-[11px] tracking-wider rounded-xl transition cursor-pointer"
                    >
                        Close
                    </button>
                </div>

                {/* --- SUB-MODAL: CREATE / EDIT FORM --- */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    <HeartPulse size={17} className="text-[#3d3f96]" />
                                    {editingFacility ? 'Update Facility / Staff' : 'Create New Facility / Staff'}
                                </h4>
                                <button
                                    onClick={handleCloseForm}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitForm} className="space-y-4">
                                
                                {/* Name Input */}
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Facility / Staff Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Oxygen Cylinder, Doctor, Ventilator"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                    />
                                </div>

                                {/* Description Input */}
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Description / Role Specification
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g. Emergency MBBS physician support for advanced life-support dispatch."
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white resize-none transition"
                                    />
                                </div>

                                {/* Default Price & Fleet Application */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                            Default Price (₹)
                                        </label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.defaultPrice}
                                                onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
                                                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                            Applicable Fleet
                                        </label>
                                        <select
                                            value={formData.applicableFor}
                                            onChange={(e) => setFormData({ ...formData, applicableFor: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] transition cursor-pointer"
                                        >
                                            <option value="all">All Fleets</option>
                                            <option value="clinic-ambulance">Clinic Only</option>
                                            <option value="ambulance">Independent Only</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Active Toggle if in editing mode */}
                                {editingFacility && (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <div>
                                            <span className="text-xs font-bold text-slate-800 block">Facility Active</span>
                                            <span className="text-[10px] text-slate-400">Enable in booking addon catalogues</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 accent-[#3d3f96] rounded cursor-pointer"
                                        />
                                    </div>
                                )}

                                {/* Form Actions */}
                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                                        <span>{editingFacility ? 'Update Facility' : 'Save Facility'}</span>
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                )}

                {/* --- SUB-MODAL: DELETE CONFIRMATION --- */}
                {deleteTarget && (
                    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl space-y-4 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                                <Trash2 size={22} />
                            </div>

                            <div>
                                <h4 className="text-base font-black text-slate-900">Delete Facility?</h4>
                                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                    Are you sure you want to delete <strong className="text-slate-800 font-bold">"{deleteTarget.name}"</strong>? This will permanently remove it from default provider addon catalogues.
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
                                    onClick={handleDeleteFacility}
                                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}