"use client";

import React, { useState, useEffect } from 'react';
import { 
    Stethoscope, 
    GraduationCap, 
    Search, 
    PlusCircle, 
    Pencil, 
    Trash2, 
    Loader2, 
    CheckCircle2, 
    AlertCircle, 
    X, 
    ShieldCheck,
    Check
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import Admin API service
import AdminAPI from '../../../../services/AdminAPI'; // Adjust relative path based on folder depth

export default function DoctorMasterDataPage() {
    // --- Active Tab State ('specializations' | 'qualifications') ---
    const [activeTab, setActiveTab] = useState('specializations');

    // --- Data & Loading States ---
    const [specializations, setSpecializations] = useState([]);
    const [qualifications, setQualifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // --- Search Filter State ---
    const [searchQuery, setSearchQuery] = useState('');

    // --- Modal Configuration States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [editingItem, setEditingItem] = useState(null);

    // --- Form States ---
    const [formName, setFormName] = useState('');
    const [formIsActive, setFormIsActive] = useState(true);

    // --- 1. Fetch Specializations (Tab ID: 37) ---
    const fetchSpecializations = async () => {
        try {
            const response = await AdminAPI.getSpecializations();
            if (response && response.success) {
                setSpecializations(response.data || []);
            }
        } catch (err) {
            console.error("Error fetching specializations:", err);
            toast.error("Failed to load medical specializations.");
        }
    };

    // --- 2. Fetch Qualifications (Tab ID: 38) ---
    const fetchQualifications = async () => {
        try {
            const response = await AdminAPI.getQualifications();
            if (response && response.success) {
                setQualifications(response.data || []);
            }
        } catch (err) {
            console.error("Error fetching qualifications:", err);
            toast.error("Failed to load doctor qualifications.");
        }
    };

    // --- Master Fetch on Mount / Tab Switch ---
    const loadMasterData = async () => {
        setLoading(true);
        if (activeTab === 'specializations') {
            await fetchSpecializations();
        } else {
            await fetchQualifications();
        }
        setLoading(false);
    };

    useEffect(() => {
        loadMasterData();
        setSearchQuery('');
    }, [activeTab]);

    // --- Open Creation Modal ---
    const openCreateModal = () => {
        setModalMode('create');
        setEditingItem(null);
        setFormName('');
        setFormIsActive(true);
        setIsModalOpen(true);
    };

    // --- Open Edit Modal ---
    const openEditModal = (item) => {
        setModalMode('edit');
        setEditingItem(item);
        setFormName(item.name || '');
        setFormIsActive(item.isActive ?? true);
        setIsModalOpen(true);
    };

    // --- Handle Create / Update Form Submit ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            toast.error("Please enter a valid title.");
            return;
        }

        setSubmitting(true);
        const payload = {
            name: formName.trim(),
            ...(modalMode === 'edit' && { isActive: formIsActive })
        };

        try {
            if (activeTab === 'specializations') {
                if (modalMode === 'create') {
                    const response = await AdminAPI.addSpecialization({ name: payload.name });
                    if (response && response.success) {
                        toast.success(response.message || "Specialization added successfully!");
                        setIsModalOpen(false);
                        fetchSpecializations();
                    }
                } else {
                    const response = await AdminAPI.updateSpecialization(editingItem._id, payload);
                    if (response && response.success) {
                        toast.success(response.message || "Specialization updated successfully!");
                        setIsModalOpen(false);
                        fetchSpecializations();
                    }
                }
            } else {
                if (modalMode === 'create') {
                    const response = await AdminAPI.addQualification({ name: payload.name });
                    if (response && response.success) {
                        toast.success(response.message || "Qualification added successfully!");
                        setIsModalOpen(false);
                        fetchQualifications();
                    }
                } else {
                    const response = await AdminAPI.updateQualification(editingItem._id, payload);
                    if (response && response.success) {
                        toast.success(response.message || "Qualification updated successfully!");
                        setIsModalOpen(false);
                        fetchQualifications();
                    }
                }
            }
        } catch (err) {
            console.error("Error saving master record:", err);
            toast.error(err.response?.data?.message || "Failed to save record.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Handle Soft Delete ---
    const handleDelete = async (item) => {
        const typeLabel = activeTab === 'specializations' ? 'Specialization' : 'Qualification';
        if (!window.confirm(`Are you sure you want to disable/soft-delete the ${typeLabel} "${item.name}"?`)) return;

        try {
            let response;
            if (activeTab === 'specializations') {
                response = await AdminAPI.deleteSpecialization(item._id);
            } else {
                response = await AdminAPI.deleteQualification(item._id);
            }

            if (response && response.success) {
                toast.success(response.message || `${typeLabel} soft-deleted successfully.`);
                loadMasterData();
            }
        } catch (err) {
            console.error("Error deleting master record:", err);
            toast.error(err.response?.data?.message || `Failed to delete ${typeLabel.toLowerCase()}.`);
        }
    };

    // Filter current list based on search query
    const activeList = activeTab === 'specializations' ? specializations : qualifications;
    const filteredList = activeList.filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        return (
            item.name?.toLowerCase().includes(query) ||
            item._id?.toLowerCase().includes(query)
        );
    });

    // Navigation Tabs Configuration
    const tabs = [
        {
            id: 'specializations',
            label: 'Specializations',
            icon: Stethoscope,
            badge: 'Tab ID: 37'
        },
        {
            id: 'qualifications',
            label: 'Qualifications',
            icon: GraduationCap,
            badge: 'Tab ID: 38'
        }
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 py-4 pb-12 antialiased select-none text-left">
            <Toaster position="top-right" />

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 flex-shrink-0 shadow-sm">
                        {activeTab === 'specializations' ? (
                            <Stethoscope className="w-7 h-7" strokeWidth={2} />
                        ) : (
                            <GraduationCap className="w-7 h-7" strokeWidth={2} />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Doctor Master Data
                        </h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                            Manage medical specializations and qualification degrees for doctor onboarding and public search filters.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition active:scale-95"
                    >
                        <PlusCircle size={15} className="stroke-[2.5]" />
                        <span>
                            {activeTab === 'specializations' ? 'ADD SPECIALIZATION' : 'ADD QUALIFICATION'}
                        </span>
                    </button>
                </div>
            </div>

            {/* --- SEGMENTED TABS & SEARCH BAR --- */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Segmented Nav Tabs */}
                    <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl gap-1.5 border border-slate-200/80 shadow-inner overflow-x-auto w-full md:w-auto [&::-webkit-scrollbar]:hidden">
                        {tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 shrink-0 border cursor-pointer ${
                                        isActive
                                            ? 'bg-red-50/60 text-red-600 border-red-200/60 shadow-sm shadow-red-100/50 scale-[1.01]'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/55'
                                    }`}
                                >
                                    <TabIcon 
                                        size={15} 
                                        className={isActive ? 'text-red-600' : 'text-slate-400'} 
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    <span>{tab.label}</span>
                                    
                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase hidden sm:inline-block border ${
                                        isActive 
                                            ? 'bg-red-100/80 border-red-200/60 text-red-600' 
                                            : 'bg-slate-200 border-transparent text-slate-500'
                                    }`}>
                                        {tab.badge}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Box */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        />
                    </div>

                </div>
            </div>

            {/* --- MASTER DATA TABLE --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading master records...</p>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Records Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        {searchQuery 
                            ? "No master items match your active search criteria."
                            : `No ${activeTab} have been created yet. Click above to add your first record.`}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-4 px-6">
                                        {activeTab === 'specializations' ? 'Specialization Title' : 'Degree / Diploma Name'}
                                    </th>
                                    <th className="py-4 px-6">Master Document ID</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {filteredList.map((item) => {
                                    const isActive = item.isActive !== false;

                                    return (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                            
                                            {/* Title / Name */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#3d3f96] shrink-0 border border-slate-200/60">
                                                        {activeTab === 'specializations' ? (
                                                            <Stethoscope size={16} />
                                                        ) : (
                                                            <GraduationCap size={16} />
                                                        )}
                                                    </div>
                                                    <strong className="text-slate-900 font-black text-sm">
                                                        {item.name}
                                                    </strong>
                                                </div>
                                            </td>

                                            {/* System ObjectID */}
                                            <td className="py-4 px-6">
                                                <span className="font-mono text-slate-400 text-[11px] bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    {item._id}
                                                </span>
                                            </td>

                                            {/* Active / Inactive Badge */}
                                            <td className="py-4 px-6">
                                                {isActive ? (
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-flex items-center gap-1">
                                                        <CheckCircle2 size={11} /> Active
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1">
                                                        <X size={11} /> Disabled
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-2 border border-slate-200 text-slate-500 hover:text-[#3d3f96] hover:bg-[#3d3f96]/5 rounded-xl transition cursor-pointer"
                                                        title="Edit details"
                                                    >
                                                        <Pencil size={14} strokeWidth={2} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                                        title="Soft Delete"
                                                    >
                                                        <Trash2 size={14} strokeWidth={2} />
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

            {/* --- CREATE / EDIT MODAL OVERLAY --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none antialiased">
                    <div className="bg-white rounded-[2rem] border border-slate-100 max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left space-y-6">
                        
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        {/* Modal Header */}
                        <div className="border-b border-slate-100 pb-4 pr-8">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                {activeTab === 'specializations' ? (
                                    <Stethoscope size={20} className="text-[#3d3f96]" />
                                ) : (
                                    <GraduationCap size={20} className="text-[#3d3f96]" />
                                )}
                                <span>
                                    {modalMode === 'create'
                                        ? `Add ${activeTab === 'specializations' ? 'Specialization' : 'Qualification'}`
                                        : `Edit ${activeTab === 'specializations' ? 'Specialization' : 'Qualification'}`}
                                </span>
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-1">
                                {activeTab === 'specializations'
                                    ? 'Enter unique medical field (e.g. Cardiologist, Diabetologist)'
                                    : 'Enter standard qualification degree (e.g. MBBS, MD, DM)'}
                            </p>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {activeTab === 'specializations' ? 'Specialization Title *' : 'Qualification Name *'}
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder={activeTab === 'specializations' ? "e.g. Endocrinologist" : "e.g. MBBS, MD"}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                />
                            </div>

                            {/* Active Toggle Switch (Shown in Edit Mode) */}
                            {modalMode === 'edit' && (
                                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                                    <div className="space-y-0.5">
                                        <span className="text-xs font-black text-slate-800 block">Active in Dropdowns</span>
                                        <p className="text-[10px] text-slate-400 font-medium">Visible to doctors during onboarding.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formIsActive}
                                            onChange={() => setFormIsActive(!formIsActive)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3d3f96]" />
                                    </label>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-75"
                                >
                                    {submitting ? <Loader2 size={13} className="animate-spin text-white" /> : <Check size={13} />}
                                    <span>{modalMode === 'create' ? 'Save Record' : 'Update Record'}</span>
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}