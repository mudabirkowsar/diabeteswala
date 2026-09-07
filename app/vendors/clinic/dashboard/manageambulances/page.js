"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Ambulance,
    Plus,
    Search,
    RefreshCw,
    Phone,
    MapPin,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Clock,
    Ban,
    Trash2,
    Edit3,
    Eye,
    FileText,
    ExternalLink,
    Activity,
    IndianRupee,
    Power,
    Gauge,
    User,
    Loader2,
    Check,
    X,
    Radio,
    Stethoscope,
    HeartPulse,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import API Services (adjust path as per your folder structure)
import ClinicAPI from '../../../../services/ClinicAPI';

// Import Add/Edit & View Modal Components
import AddAmbulance from './components/AddAmbulance';
import ViewAmbulance from './components/ViewAmbulance';

export default function ClinicAmbulancesPage() {
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Approved' | 'Pending' | 'Rejected'
    const [typeFilter, setTypeFilter] = useState('ALL');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAmbulance, setSelectedAmbulance] = useState(null); // For edit
    const [viewAmbulanceData, setViewAmbulanceData] = useState(null); // For view modal
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // --- 1. Fetch Clinic Ambulances ---
    const fetchAmbulances = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ClinicAPI.getClinicAmbulancesList();
            if (response && response.success) {
                setAmbulances(response.data || []);
            }
        } catch (err) {
            console.error('Error fetching clinic ambulances:', err);
            toast.error(err.response?.data?.message || 'Failed to fetch clinic ambulances.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAmbulances();
    }, [fetchAmbulances]);

    // --- 2. Toggle Emergency Duty Status ---
    const handleToggleEmergency = async (id, currentStatus, e) => {
        if (e) e.stopPropagation();
        setTogglingId(id);
        try {
            const response = await ClinicAPI.toggleAmbulanceEmergencyStatus(id);
            if (response && response.success) {
                toast.success(response.message || 'Emergency readiness status updated!');
                const updatedAvailable = response.availableForEmergency !== undefined ? response.availableForEmergency : !currentStatus;
                setAmbulances((prev) =>
                    prev.map((item) =>
                        item._id === id
                            ? { ...item, availableForEmergency: updatedAvailable }
                            : item
                    )
                );
                if (viewAmbulanceData && viewAmbulanceData._id === id) {
                    setViewAmbulanceData(prev => ({ ...prev, availableForEmergency: updatedAvailable }));
                }
            }
        } catch (err) {
            console.error('Error toggling emergency status:', err);
            toast.error(err.response?.data?.message || 'Failed to toggle emergency status.');
        } finally {
            setTogglingId(null);
        }
    };

    // --- 3. Delete Ambulance ---
    const handleDelete = async (id, vehicleNumber, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete ambulance "${vehicleNumber}"? All records and statutory documents will be permanently removed.`)) {
            return;
        }

        setDeletingId(id);
        try {
            const response = await ClinicAPI.deleteClinicAmbulance(id);
            if (response && response.success) {
                toast.success(response.message || 'Ambulance removed successfully.');
                setAmbulances((prev) => prev.filter((item) => item._id !== id));
                if (viewAmbulanceData && viewAmbulanceData._id === id) {
                    setIsViewModalOpen(false);
                    setViewAmbulanceData(null);
                }
            }
        } catch (err) {
            console.error('Error deleting ambulance:', err);
            toast.error(err.response?.data?.message || 'Failed to delete ambulance.');
        } finally {
            setDeletingId(null);
        }
    };

    // --- 4. Open View Modal ---
    const handleOpenViewModal = (ambulance) => {
        setViewAmbulanceData(ambulance);
        setIsViewModalOpen(true);
    };

    // --- Filter Logic ---
    const filteredAmbulances = ambulances.filter((item) => {
        const matchesSearch =
            (item.vehicleNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.phone || '').includes(searchTerm);

        const matchesStatus = statusFilter === 'ALL' || item.profileStatus === statusFilter;
        const matchesType = typeFilter === 'ALL' || item.vehicleType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    // Metric Counts
    const totalCount = ambulances.length;
    const emergencyAvailableCount = ambulances.filter((a) => a.availableForEmergency).length;
    const onlineCount = ambulances.filter((a) => a.isOnline).length;
    const pendingCount = ambulances.filter((a) => a.profileStatus === 'Pending').length;

    // Helper: Render Status Badge
    const renderStatusBadge = (status) => {
        if (status === 'Approved') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                    <CheckCircle2 size={11} className="text-emerald-500" /> Approved
                </span>
            );
        }
        if (status === 'Rejected') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shadow-2xs">
                    <Ban size={11} className="text-rose-500" /> Rejected
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
                <Clock size={11} className="text-amber-500 animate-pulse" /> Pending
            </span>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-7 py-4 pb-20 antialiased select-none text-left">
            <Toaster position="top-right" />

            {/* --- TOP HEADER --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/20 shadow-xs shrink-0">
                        <Ambulance className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Clinic Ambulance Management
                            </h1>
                            <span className="text-[11px] font-black uppercase text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full shadow-xs">
                                {totalCount} Registered Units
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                            Manage medical transport fleet, assign on-board doctors & nurses, configure dynamic fares, and monitor live emergency status.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={fetchAmbulances}
                        disabled={loading}
                        className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin text-red-600' : ''} />
                        <span>Refresh List</span>
                    </button>

                    <button
                        onClick={() => {
                            setSelectedAmbulance(null);
                            setIsModalOpen(true);
                        }}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/20 transition flex items-center gap-2 cursor-pointer"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span>Add Ambulance</span>
                    </button>
                </div>
            </div>

            {/* --- STAT METRIC CARDS --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
                        <Ambulance size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Total Fleet</span>
                        <h3 className="text-2xl font-black text-slate-900">{totalCount}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                        <Activity size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Emergency Ready</span>
                        <h3 className="text-2xl font-black text-emerald-600">{emergencyAvailableCount}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                        <Radio size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Online Drivers</span>
                        <h3 className="text-2xl font-black text-blue-600">{onlineCount}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                        <Clock size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Pending Approval</span>
                        <h3 className="text-2xl font-black text-amber-600">{pendingCount}</h3>
                    </div>
                </div>
            </div>

            {/* --- FILTER & SEARCH BAR --- */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by plate number, driver, or mobile..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                    {/* Status Tabs */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
                        {['ALL', 'Approved', 'Pending', 'Rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${statusFilter === status
                                        ? 'bg-white text-red-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {status === 'ALL' ? 'All Status' : status}
                            </button>
                        ))}
                    </div>

                    {/* Vehicle Type Dropdown */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                        <option value="ALL">All Vehicle Types</option>
                        <option value="Van">Van</option>
                        <option value="Mini Van">Mini Van</option>
                        <option value="Advance Life Support">Advance Life Support</option>
                        <option value="ICU Ambulance">ICU Ambulance</option>
                    </select>
                </div>
            </div>

            {/* --- AMBULANCES TABLE LEDGER (CHANGE 1: TABLE FORMAT) --- */}
            {loading ? (
                <div className="py-28 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="animate-spin text-red-600" size={36} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning fleet registers...</p>
                </div>
            ) : filteredAmbulances.length === 0 ? (
                <div className="py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-xs flex flex-col items-center justify-center text-center p-6">
                    <Ambulance size={48} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Ambulances Registered</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No ambulance units match your filter criteria. Click &ldquo;Add Ambulance&rdquo; to register a new unit.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-black bg-slate-50/70 tracking-wider">
                                    <th className="py-4.5 px-6">Vehicle Plate & Type</th>
                                    <th className="py-4.5 px-6">Driver & Contact</th>
                                    <th className="py-4.5 px-6">Fare Structure</th>
                                    <th className="py-4.5 px-6">Emergency & Driver Status</th>
                                    <th className="py-4.5 px-6">Verification</th>
                                    <th className="py-4.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {filteredAmbulances.map((amb) => {
                                    const pricing = amb.pricing || {};
                                    const supportStaff = amb.supportStaff || {};
                                    const hasNurse = supportStaff.nurse?.available;
                                    const hasDoctor = supportStaff.doctor?.available;

                                    return (
                                        <tr
                                            key={amb._id}
                                            onClick={() => handleOpenViewModal(amb)}
                                            className="hover:bg-red-50/30 transition-colors cursor-pointer group"
                                        >
                                            {/* 1. Vehicle Plate & Type */}
                                            <td className="py-4.5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200/70 flex items-center justify-center shrink-0">
                                                        <Ambulance size={20} />
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm font-black text-slate-900 group-hover:text-red-600 transition-colors block">
                                                            {amb.vehicleNumber || 'Unregistered'}
                                                        </strong>
                                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100/70 text-red-700 border border-red-200">
                                                            {amb.vehicleType || 'Van'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. Driver & Contact */}
                                            <td className="py-4.5 px-6">
                                                <span className="font-extrabold text-slate-900 block text-xs">
                                                    {amb.name}
                                                </span>
                                                <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                                                    {amb.phone}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block">
                                                    {amb.city || 'Mohali'} • {amb.serviceRadius || '15 km'}
                                                </span>
                                            </td>

                                            {/* 4. Fare Structure */}
                                            <td className="py-4.5 px-6">
                                                <div className="text-xs space-y-0.5 font-bold">
                                                    <span className="text-slate-900 block">
                                                        ₹{pricing.singleRidePrice || 400} <span className="text-[10px] text-slate-400 font-semibold">(One-Way)</span>
                                                    </span>
                                                    <span className="text-slate-600 block text-[11px]">
                                                        ₹{pricing.doubleRidePrice || 700} <span className="text-[10px] text-slate-400 font-semibold">(Round)</span> • ₹{pricing.pricePerKM || 12}/km
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 5. Emergency & Online Status */}
                                            <td className="py-4.5 px-6" onClick={(e) => e.stopPropagation()}>
                                                <div className="space-y-2">
                                                    <button
                                                        disabled={togglingId === amb._id}
                                                        onClick={(e) => handleToggleEmergency(amb._id, amb.availableForEmergency, e)}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1.5 border cursor-pointer ${amb.availableForEmergency
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {togglingId === amb._id ? (
                                                            <Loader2 size={11} className="animate-spin" />
                                                        ) : (
                                                            <Power size={11} />
                                                        )}
                                                        <span>{amb.availableForEmergency ? 'Emergency Ready' : 'On Duty / Busy'}</span>
                                                    </button>

                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                        <span className={`w-2 h-2 rounded-full ${amb.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                        <span>{amb.isOnline ? 'Driver Online' : 'Driver Offline'}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 6. Admin Approval Status */}
                                            <td className="py-4.5 px-6">
                                                {renderStatusBadge(amb.profileStatus)}
                                            </td>

                                            {/* 7. Row Actions */}
                                            <td className="py-4.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* CHANGE 2: VIEW DETAILS BUTTON */}
                                                    <button
                                                        onClick={() => handleOpenViewModal(amb)}
                                                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                                                        title="View Complete Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedAmbulance(amb);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl transition cursor-pointer"
                                                        title="Edit Ambulance"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>

                                                    <button
                                                        onClick={(e) => handleDelete(amb._id, amb.vehicleNumber, e)}
                                                        disabled={deletingId === amb._id}
                                                        className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl transition cursor-pointer disabled:opacity-50"
                                                        title="Delete Ambulance"
                                                    >
                                                        {deletingId === amb._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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

            {/* --- ADD / EDIT AMBULANCE MODAL --- */}
            {isModalOpen && (
                <AddAmbulance
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedAmbulance(null);
                    }}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedAmbulance(null);
                        fetchAmbulances();
                    }}
                    editData={selectedAmbulance}
                />
            )}

            {/* --- VIEW AMBULANCE MODAL (CHANGE 2) --- */}
            {isViewModalOpen && (
                <ViewAmbulance
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setViewAmbulanceData(null);
                    }}
                    ambulanceData={viewAmbulanceData}
                    onEdit={(ambulance) => {
                        setIsViewModalOpen(false);
                        setSelectedAmbulance(ambulance);
                        setIsModalOpen(true);
                    }}
                    onToggleEmergency={handleToggleEmergency}
                    togglingId={togglingId}
                />
            )}

        </div>
    );
}