"use client";

import React, { useState, useEffect } from 'react';
import {
    Store,
    PlusCircle,
    Trash2,
    Phone,
    Mail,
    Search,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Eye,
    Clock,
    Truck,
    MapPin
} from 'lucide-react';

import ClinicAPI from '../../../../services/ClinicAPI'; // Adjust path if needed
import AddClinicPharmacy from './components/AddClinicPharmacy';
import ViewClinicPharmacy from './components/ViewClinicPharmacy';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002';

const getImageUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=200';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
        return path;
    }
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function ClinicPharmaciesPage() {
    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Load clinic pharmacy list
    const fetchPharmacies = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await ClinicAPI.getMyPharmacies();
            if (res?.success && Array.isArray(res.data)) {
                setPharmacies(res.data);
            } else {
                setPharmacies([]);
            }
        } catch (err) {
            console.error("Failed to fetch clinic pharmacies:", err);
            setError(err.response?.data?.message || "Could not load clinic pharmacies.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPharmacies();
    }, []);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Toggle Active / Inactive Status
    const handleToggleStatus = async (e, pharmacyId) => {
        e.stopPropagation();
        try {
            const res = await ClinicAPI.togglePharmacyStatus(pharmacyId);
            if (res?.success) {
                setPharmacies(prev =>
                    prev.map(p => (p._id === pharmacyId ? { ...p, isActive: res.isActive } : p))
                );
                showToast(res.message || "Pharmacy status updated successfully.");
            }
        } catch (err) {
            console.error("Toggle status failed:", err);
            showToast(err.response?.data?.message || "Status update failed.");
        }
    };

    // Delete Pharmacy
    const handleDelete = async (e, pharmacy) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to permanently delete "${pharmacy.name}" and all its records?`)) return;

        try {
            const res = await ClinicAPI.deletePharmacy(pharmacy._id);
            if (res?.success) {
                setPharmacies(prev => prev.filter(p => p._id !== pharmacy._id));
                showToast(`Pharmacy "${pharmacy.name}" deleted successfully.`);
            }
        } catch (err) {
            console.error("Delete pharmacy failed:", err);
            alert(err.response?.data?.message || "Could not delete pharmacy.");
        }
    };

    const handlePharmacyAdded = (newPharmacy) => {
        setPharmacies(prev => [newPharmacy, ...prev]);
        showToast(`Pharmacy "${newPharmacy.name}" registered and submitted for approval!`);
    };

    const handlePharmacyUpdated = (updatedPharmacy, message) => {
        setPharmacies(prev =>
            prev.map(p => (p._id === (updatedPharmacy._id || selectedPharmacyId) ? { ...p, ...updatedPharmacy } : p))
        );
        showToast(message || "Pharmacy profile updated successfully!");
    };

    const handleRowClick = (pharmacyId) => {
        setSelectedPharmacyId(pharmacyId);
        setShowViewModal(true);
    };

    // Search filtering
    const filteredPharmacies = pharmacies.filter(p => {
        const q = searchTerm.toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(q);
        const phoneMatch = p.phone?.includes(q);
        const cityMatch = p.city?.toLowerCase().includes(q);
        return nameMatch || phoneMatch || cityMatch;
    });

    // Pagination calculation
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentList = filteredPharmacies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPharmacies.length / itemsPerPage);

    return (
        <div className="space-y-8 select-none">

            {/* Toast Alert */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-[999999] px-5 py-3 rounded-2xl bg-[#3D3F96] text-white text-xs font-bold shadow-2xl border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
                    <CheckCircle2 size={16} /> {toastMessage}
                </div>
            )}

            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Clinic Pharmacies</h2>
                    <p className="text-xs text-slate-400 mt-1">Manage in-house dispensary inventory units, drug licenses, and operational status.</p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-indigo-950/10 self-start sm:self-auto"
                >
                    <PlusCircle size={16} /> Add Pharmacy
                </button>
            </div>

            {/* Stats & Search Filter */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Pharmacy Registry</span>
                    <h4 className="text-xl font-black text-slate-800 mt-1">Store Directory</h4>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search by store name, phone, city..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-[#3D3F96] w-64 transition-all"
                        />
                    </div>

                    <span className="inline-block px-4 py-2 rounded-2xl text-xs font-bold bg-[#3D3F96]/10 text-[#3D3F96] shrink-0">
                        {filteredPharmacies.length} Pharmacies
                    </span>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700 text-xs font-semibold">
                    <AlertCircle size={18} className="shrink-0" /> {error}
                    <button onClick={fetchPharmacies} className="underline font-bold ml-auto">Retry</button>
                </div>
            )}

            {/* Table Container */}
            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse align-middle">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                <th className="p-4 w-20">Store</th>
                                <th className="p-4">Pharmacy Details</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Location</th>
                                <th className="p-4 text-center">Services</th>
                                <th className="p-4 text-center">Approval</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-slate-400">
                                        <Loader2 className="animate-spin text-2xl mx-auto mb-2 text-[#3D3F96]" size={24} />
                                        <span className="text-xs font-medium">Loading clinic pharmacies...</span>
                                    </td>
                                </tr>
                            ) : currentList.length > 0 ? (
                                currentList.map((pharmacy) => (
                                    <tr
                                        key={pharmacy._id}
                                        onClick={() => handleRowClick(pharmacy._id)}
                                        className="hover:bg-indigo-50/10 cursor-pointer transition-all"
                                    >
                                        <td className="p-4">
                                            <img
                                                src={getImageUrl(pharmacy.profileImage)}
                                                alt={pharmacy.name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=200';
                                                }}
                                                className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{pharmacy.name}</div>
                                            <div className="text-[11px] text-slate-400 font-medium">
                                                {pharmacy.documents?.drugLicenseNumber || 'License on file'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                <Phone size={11} className="text-slate-400" /> {pharmacy.phone}
                                            </div>
                                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Mail size={11} className="text-slate-400" /> {pharmacy.email || '-'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                <MapPin size={11} className="text-slate-400" /> {pharmacy.city || 'N/A'}, {pharmacy.state || ''}
                                            </div>
                                            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{pharmacy.address || '-'}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {pharmacy.is24x7 && (
                                                    <span className="p-1 rounded bg-amber-50 text-amber-600 text-[10px] font-bold" title="24x7 Service">
                                                        <Clock size={13} />
                                                    </span>
                                                )}
                                                {pharmacy.isHomeDeliveryAvailable && (
                                                    <span className="p-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold" title="Home Delivery">
                                                        <Truck size={13} />
                                                    </span>
                                                )}
                                                {!pharmacy.is24x7 && !pharmacy.isHomeDeliveryAvailable && (
                                                    <span className="text-[10px] text-slate-400 font-semibold">Standard</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${pharmacy.profileStatus === 'Approved'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                    : pharmacy.profileStatus === 'Rejected'
                                                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                                                }`}>
                                                {pharmacy.profileStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                onClick={(e) => handleToggleStatus(e, pharmacy._id)}
                                                className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all border ${pharmacy.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {pharmacy.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRowClick(pharmacy._id); }}
                                                    className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-indigo-50 text-slate-400 hover:text-[#3D3F96] transition-all"
                                                    title="View / Edit Pharmacy"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, pharmacy)}
                                                    className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"
                                                    title="Delete Pharmacy"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-slate-400 font-bold">
                                        <Store className="text-3xl mx-auto mb-2 text-indigo-400" size={32} />
                                        <h5>No Pharmacies Found</h5>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">
                            Showing <strong className="text-slate-700">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPharmacies.length)}</strong> of <strong className="text-slate-700">{filteredPharmacies.length}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                className="p-2 rounded-xl border border-slate-100 bg-white disabled:opacity-40 hover:bg-slate-50"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold ${currentPage === i + 1 ? 'bg-[#3D3F96] text-white' : 'bg-white border border-slate-100 text-slate-600'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                className="p-2 rounded-xl border border-slate-100 bg-white disabled:opacity-40 hover:bg-slate-50"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- ADD MODAL --- */}
            {showAddModal && (
                <AddClinicPharmacy
                    onClose={() => setShowAddModal(false)}
                    onPharmacyAdded={handlePharmacyAdded}
                />
            )}

            {/* --- VIEW & EDIT MODAL --- */}
            {showViewModal && selectedPharmacyId && (
                <ViewClinicPharmacy
                    pharmacyId={selectedPharmacyId}
                    onClose={() => { setShowViewModal(false); setSelectedPharmacyId(null); }}
                    onPharmacyUpdated={handlePharmacyUpdated}
                />
            )}

        </div>
    );
}