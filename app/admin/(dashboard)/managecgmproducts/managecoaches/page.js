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
    Loader2,
    Users,
    Star,
    MapPin,
    Eye,
    ToggleLeft,
    ToggleRight,
    ChevronLeft,
    ChevronRight,
    Clock,
    User
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import AdminAPI from '../../../../services/AdminAPI';
import CreateCoach from './components/CreateCoach';
import ViewCoach from './components/ViewCoach';

// Helper to construct full backend image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.6:5002').replace(/\/$/, '');
    const cleanPath = imagePath.replace(/^\//, '');
    return `${backendUrl}/${cleanPath}`;
};

export default function DiabetesCoachesPage() {
    // --- Data & Loading States ---
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // --- Search & Filters ---
    const [searchQuery, setSearchQuery] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

    // --- Pagination ---
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCoaches, setTotalCoaches] = useState(0);

    // --- Modal States ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [selectedCoach, setSelectedCoach] = useState(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewCoachId, setViewCoachId] = useState(null);

    // --- Delete Confirmation State ---
    const [deleteTarget, setDeleteTarget] = useState(null);

    // 1. Fetch Coaches
    const fetchCoaches = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit
            };

            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (cityFilter.trim()) params.city = cityFilter.trim();
            if (statusFilter === 'ACTIVE') params.activeOnly = true;

            const response = await AdminAPI.getAllDiabetesCoaches(params);
            if (response && response.success) {
                setCoaches(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalCoaches(response.totalCoaches ?? response.count ?? 0);
            } else {
                toast.error(response?.message || 'Failed to load coaches catalogue.');
            }
        } catch (err) {
            console.error('Error fetching coaches:', err);
            toast.error(err.response?.data?.message || 'Error connecting to coaches service.');
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchQuery, cityFilter, statusFilter]);

    useEffect(() => {
        fetchCoaches();
    }, [fetchCoaches]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCoaches();
    };

    // 2. Toggle Status
    const handleToggleStatus = async (coach) => {
        setActionLoading(true);
        try {
            const response = await AdminAPI.toggleDiabetesCoachStatus(coach._id);
            if (response && response.success) {
                toast.success(response.message || 'Status updated!');
                setCoaches((prev) =>
                    prev.map((c) =>
                        c._id === coach._id ? { ...c, isActive: !c.isActive } : c
                    )
                );
            } else {
                toast.error(response?.message || 'Could not toggle status.');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error(err.response?.data?.message || 'Failed to update coach status.');
        } finally {
            setActionLoading(false);
        }
    };

    // 3. Confirm Delete
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setActionLoading(true);
        try {
            const response = await AdminAPI.deleteDiabetesCoach(deleteTarget._id);
            if (response && response.success) {
                toast.success(response.message || 'Coach deleted permanently.');
                setDeleteTarget(null);
                fetchCoaches();
            } else {
                toast.error(response?.message || 'Failed to delete coach.');
            }
        } catch (err) {
            console.error('Error deleting coach:', err);
            toast.error(err.response?.data?.message || 'Failed to delete coach.');
        } finally {
            setActionLoading(false);
        }
    };

    const activeCount = coaches.filter((c) => c.isActive).length;
    const inactiveCount = coaches.filter((c) => !c.isActive).length;

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
                                Diabetes Coaches & Counselors
                            </h1>
                            <span className="text-[11px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full shadow-2xs">
                                CGM Clinical Directory
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                            Manage certified diabetes educators, CGM reading counselors, consultations, and slot timings.
                        </p>
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={fetchCoaches}
                        disabled={loading}
                        className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        title="Refresh coaches directory"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin text-[#3d3f96]' : ''} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={() => {
                            setSelectedCoach(null);
                            setFormMode('create');
                            setIsFormModalOpen(true);
                        }}
                        className="px-6 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-950/15 transition flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span>Add Coach</span>
                    </button>
                </div>
            </div>

            {/* --- STAT METRIC CARDS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
                        <Users size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                            Total Counselors
                        </span>
                        <h3 className="text-2xl font-black text-slate-900">{totalCoaches}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                            Active Available
                        </span>
                        <h3 className="text-2xl font-black text-emerald-600">{activeCount}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                        <Ban size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                            Inactive Coaches
                        </span>
                        <h3 className="text-2xl font-black text-rose-600">{inactiveCount}</h3>
                    </div>
                </div>
            </div>

            {/* --- SEARCH & FILTER BAR --- */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                            placeholder="Search by name, phone, email, city..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        />
                    </div>

                    <div className="relative w-full sm:w-48">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                            placeholder="Filter by city..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        />
                    </div>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    {[
                        { id: 'ALL', label: 'All Counselors' },
                        { id: 'ACTIVE', label: 'Active Only' },
                        { id: 'INACTIVE', label: 'Inactive Only' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setStatusFilter(tab.id);
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${statusFilter === tab.id
                                    ? 'bg-white text-[#3d3f96] shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- COACHES TABLE --- */}
            {loading ? (
                <div className="py-28 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Accessing diabetes coach records...
                    </p>
                </div>
            ) : coaches.length === 0 ? (
                <div className="py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-xs flex flex-col items-center justify-center text-center p-6">
                    <Users size={48} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Coaches Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No coach matches your criteria. Add new counselors using the &ldquo;Add Coach&rdquo; button above.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-black bg-slate-50/70 tracking-wider">
                                    <th className="py-4.5 px-6">Coach Name & Profile</th>
                                    <th className="py-4.5 px-6">Fee & Slot Timings</th>
                                    <th className="py-4.5 px-6">Contact / Location</th>
                                    <th className="py-4.5 px-6">Rating</th>
                                    <th className="py-4.5 px-6">Active Status</th>
                                    <th className="py-4.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {coaches.map((coach) => (
                                    <tr key={coach._id} className="hover:bg-slate-50/70 transition-colors">

                                        {/* Avatar & Name */}
                                        <td className="py-4.5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0 relative">
                                                    {coach.profileImage ? (
                                                        <img
                                                            src={getImageUrl(coach.profileImage)}
                                                            alt={coach.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <User size={18} className="text-[#3d3f96]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <strong className="text-sm font-black text-slate-900 block">
                                                        {coach.name}
                                                    </strong>
                                                    <span className="text-[10px] font-mono text-slate-400">
                                                        ID: {coach._id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Fee & Slot Timings */}
                                        <td className="py-4.5 px-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-black text-slate-900">
                                                        ₹{coach.price}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">/ session</span>
                                                </div>
                                                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                                                    <Clock size={11} className="text-[#3d3f96]" />
                                                    <span>{coach.slotTimings || 'Not Configured'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact / Location */}
                                        <td className="py-4.5 px-6">
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-bold text-slate-800 block">
                                                    {coach.phone || coach.email || 'No direct contact'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <MapPin size={10} />
                                                    {[coach.location?.city, coach.location?.state].filter(Boolean).join(', ') || 'Online'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Rating */}
                                        <td className="py-4.5 px-6">
                                            <div className="flex items-center gap-1 text-amber-500 font-black">
                                                <Star size={13} fill="currentColor" />
                                                <span>{coach.rating || '0.0'}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {coach.totalReviews || 0} reviews
                                            </span>
                                        </td>

                                        {/* Toggle Status */}
                                        <td className="py-4.5 px-6">
                                            <button
                                                onClick={() => handleToggleStatus(coach)}
                                                disabled={actionLoading}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${coach.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                    }`}
                                            >
                                                {coach.isActive ? (
                                                    <>
                                                        <ToggleRight size={16} />
                                                        <span>Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft size={16} />
                                                        <span>Inactive</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>

                                        {/* Action buttons */}
                                        <td className="py-4.5 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setViewCoachId(coach._id);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                                                    title="View Full Profile & Slot Details"
                                                >
                                                    <Eye size={14} />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedCoach(coach);
                                                        setFormMode('edit');
                                                        setIsFormModalOpen(true);
                                                    }}
                                                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition cursor-pointer"
                                                    title="Edit Coach Details"
                                                >
                                                    <Edit3 size={14} />
                                                </button>

                                                <button
                                                    onClick={() => setDeleteTarget(coach)}
                                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition cursor-pointer"
                                                    title="Delete Coach"
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                            <span>
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-40 cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-40 cursor-pointer"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <CreateCoach
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedCoach(null);
                }}
                onSuccess={fetchCoaches}
                initialData={selectedCoach}
                mode={formMode}
            />

            <ViewCoach
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewCoachId(null);
                }}
                coachId={viewCoachId}
            />

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl space-y-4 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                            <Trash2 size={22} />
                        </div>

                        <div>
                            <h4 className="text-base font-black text-slate-900">Delete Counselor?</h4>
                            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                Are you sure you want to remove <strong className="text-slate-800 font-bold">&ldquo;{deleteTarget.name}&rdquo;</strong>? This will permanently wipe the coach account along with their profile image.
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