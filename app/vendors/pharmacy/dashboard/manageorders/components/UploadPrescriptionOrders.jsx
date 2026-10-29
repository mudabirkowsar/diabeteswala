"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Loader2,
    Phone,
    CheckCircle2,
    AlertCircle,
    Eye,
    Inbox,
    Clock,
    User,
    ChevronLeft,
    ChevronRight,
    FileText,
    Stethoscope,
    Calendar,
    ReceiptText,
    ExternalLink
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import PharmacyAPI from '../../../../../services/PharmacyVendorAPI';

export default function UploadPrescriptionOrders() {
    const router = useRouter();

    // --- State Management ---
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const limit = 15;

    const statusOptions = [
        'All',
        'Pending Review',
        'Reviewing',
        'Bill Generated',
        'Paid / Placed',
        'Rejected'
    ];

    // Helper for Prescription Image URLs
    const getFullImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const baseUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            process.env.NEXT_PUBLIC_BASE_URL ||
            'http://192.168.1.3:5002';
        return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    };

    // --- Fetch Prescription Requests ---
    const fetchPrescriptionRequests = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedStatus !== 'All') {
                if (selectedStatus === 'Paid / Placed') {
                    params.status = 'Paid';
                } else {
                    params.status = selectedStatus;
                }
            }

            const response = await PharmacyAPI.getProviderPrescriptionRequests(params);

            if (response && response.success) {
                setRequests(response.data || []);
            } else {
                setRequests([]);
            }
        } catch (err) {
            console.error("Error retrieving prescription requests:", err);
            toast.error(err?.response?.data?.message || err?.message || "Failed to load prescription requests.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptionRequests();
        setPage(1);
    }, [selectedStatus]);

    // Client-side search across Request ID, Patient Name, Phone, and Doctor Name
    const filteredRequests = requests.filter((req) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
            req.requestId?.toLowerCase().includes(q) ||
            req.userId?.name?.toLowerCase().includes(q) ||
            req.userId?.phone?.includes(q) ||
            req.doctorName?.toLowerCase().includes(q)
        );
    });

    // Pagination calculations
    const totalOrders = filteredRequests.length;
    const totalPages = Math.ceil(totalOrders / limit) || 1;
    const paginatedRequests = filteredRequests.slice((page - 1) * limit, page * limit);

    // --- Status Badge Helper ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase();
        if (uppercase === 'PAID' || uppercase === 'PLACED' || uppercase === 'CONFIRMED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 w-fit">
                    <CheckCircle2 size={11} /> Order Placed
                </span>
            );
        }
        if (uppercase === 'BILL GENERATED' || uppercase === 'ACCEPTED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1.5 w-fit">
                    <ReceiptText size={11} /> Bill Generated
                </span>
            );
        }
        if (uppercase === 'REVIEWING') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5 w-fit">
                    <Clock size={11} className="animate-spin" /> Reviewing
                </span>
            );
        }
        if (uppercase === 'PENDING REVIEW' || uppercase === 'PENDING') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Pending Review
                </span>
            );
        }
        if (uppercase === 'REJECTED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5 w-fit">
                    <AlertCircle size={11} /> Rejected
                </span>
            );
        }
        return (
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 w-fit">
                {status || 'Unknown'}
            </span>
        );
    };

    return (
        <div className="space-y-6 text-left select-none antialiased">
            <Toaster position="top-right" />

            {/* --- TOP SEARCH & STATUS FILTER BAR --- */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                    {/* Search Input */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Request ID, Patient, Doctor..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        />
                    </div>

                    {/* Status Tabs Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto [&::-webkit-scrollbar]:hidden pb-1 md:pb-0">
                        {statusOptions.map((status) => {
                            const isSelected = selectedStatus === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${isSelected
                                            ? 'bg-[#3d3f96] text-white border-[#3d3f96] font-black shadow-sm'
                                            : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                        }`}
                                >
                                    {status}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- PRESCRIPTION REQUESTS TABLE --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Loading prescription requests...
                    </p>
                </div>
            ) : paginatedRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Prescription Inquiries Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No uploaded prescription tickets match the selected filter criteria.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-4 px-5">Ticket ID &amp; Submitted</th>
                                    <th className="py-4 px-5">Patient Details</th>
                                    <th className="py-4 px-5">Prescription Slip</th>
                                    <th className="py-4 px-5">Doctor &amp; Rx Date</th>
                                    <th className="py-4 px-5">Course Duration</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5 text-right">Audit / Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {paginatedRequests.map((req) => {
                                    const timeFormatted = req.createdAt
                                        ? new Date(req.createdAt).toLocaleDateString("en-US", {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : '—';

                                    const rxDateFormatted = req.prescriptionDate
                                        ? new Date(req.prescriptionDate).toLocaleDateString("en-US", {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })
                                        : '—';

                                    // Strictly send MongoDB _id
                                    const mongoId = req._id;

                                    return (
                                        <tr
                                            key={req._id}
                                            onClick={() => router.push(`/vendors/pharmacy/dashboard/manageorders/rxorderdetail/${mongoId}`)}
                                            className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                                        >
                                            {/* Ticket ID & Submitted */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-1">
                                                    <strong className="text-slate-900 font-black tracking-tight block group-hover:text-[#3d3f96] transition-colors font-mono">
                                                        #{req.requestId}
                                                    </strong>
                                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                        <Clock size={11} /> {timeFormatted}
                                                    </span>
                                                    <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-50 text-[#3d3f96] border border-purple-200">
                                                        Upload Rx
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Patient Info */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-2.5 min-w-[160px]">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                                                        <User size={15} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <strong className="block text-slate-800 font-extrabold truncate">
                                                            {req.userId?.name || "Patient"}
                                                        </strong>
                                                        <a
                                                            href={`tel:${req.userId?.phone}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[10px] text-[#3d3f96] font-bold hover:underline flex items-center gap-1"
                                                        >
                                                            <Phone size={10} /> {req.userId?.phone || "No Phone"}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Prescription Slip Preview */}
                                            <td className="py-4 px-5">
                                                {req.prescriptionImage ? (
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(getFullImageUrl(req.prescriptionImage), '_blank');
                                                        }}
                                                        className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative group/img cursor-zoom-in shrink-0 shadow-xs"
                                                    >
                                                        <img
                                                            src={getFullImageUrl(req.prescriptionImage)}
                                                            alt="Prescription"
                                                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-200"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                            <ExternalLink size={12} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <FileText size={18} />
                                                    </div>
                                                )}
                                            </td>

                                            {/* Doctor & Rx Date */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-1">
                                                    <strong className="text-slate-800 font-bold block flex items-center gap-1 truncate max-w-[180px]">
                                                        <Stethoscope size={12} className="text-[#3d3f96] shrink-0" />
                                                        {req.doctorName || 'Not Mentioned'}
                                                    </strong>
                                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                        <Calendar size={11} /> {rxDateFormatted}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Duration Type */}
                                            <td className="py-4 px-5">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                                    {req.durationType || 'Full Course'}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-5">
                                                {renderStatusBadge(req.status)}
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-4 px-5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/vendors/pharmacy/dashboard/manageorders/rxorderdetail/${mongoId}`);
                                                    }}
                                                    className="px-3.5 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                                                >
                                                    <Eye size={13} />
                                                    <span>Audit &amp; Bill</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="py-3 px-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-medium">
                                Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalOrders} tickets)
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}