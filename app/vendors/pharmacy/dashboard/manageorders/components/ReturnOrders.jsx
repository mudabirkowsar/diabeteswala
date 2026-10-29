"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    RotateCcw,
    XCircle,
    RefreshCw,
    Search,
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    AlertCircle,
    User,
    Phone,
    MapPin,
    Package,
    IndianRupee,
    CreditCard,
    Zap,
    FileText,
    Truck,
    Loader2,
    Eye,
    X,
    ImageIcon
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import PharmacyAPI from '../../../../../services/PharmacyVendorAPI'
// Base Media Server Helper for customer-uploaded proof photos
const BASE_SERVER_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL.replace(/\/+$/, '')}/${cleanPath}`;
};

export default function ReturnOrders() {
    const router = useRouter();

    // Data States
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter & Pagination States
    const [selectedType, setSelectedType] = useState('All'); // 'All' | 'Cancelled' | 'Return' | 'Replacement'
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 15;

    // Proof Image Preview Modal State
    const [previewImage, setPreviewImage] = useState(null);

    // Fetch Ledger Data
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: limit,
                ...(selectedType !== 'All' && { type: selectedType })
            };

            const response = await PharmacyAPI.getCancelledAndReturnedOrders(params);

            if (response && response.success) {
                setOrders(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalRecords(response.total || 0);
            } else {
                toast.error(response?.message || "Failed to fetch orders ledger.");
            }
        } catch (error) {
            console.error("Error loading cancelled & returned orders:", error);
            toast.error(error?.response?.data?.message || "Error loading orders ledger.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedType]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Handle Tab Filter Changes
    const handleTabChange = (type) => {
        setSelectedType(type);
        setCurrentPage(1);
    };

    // Navigate to Order Details
    const handleNavigateToDetail = (item) => {
        const targetId =item._id;
        // Adjust the base path below if your order detail page route is slightly different
        router.push(`/vendors/pharmacy/dashboard/manageorders/orderdetail/${targetId}`);
    };

    // Client-side search filtering
    const filteredOrders = orders.filter((item) => {
        if (!searchTerm.trim()) return true;
        const query = searchTerm.toLowerCase();
        return (
            item.orderId?.toLowerCase().includes(query) ||
            item.customer?.name?.toLowerCase().includes(query) ||
            item.customer?.phone?.includes(query) ||
            item.deliveryCity?.toLowerCase().includes(query)
        );
    });

    // Helper: Category Badge Styling
    const renderCategoryBadge = (category, isRapid) => {
        const cat = (category || '').toLowerCase();

        return (
            <div className="flex items-center gap-1.5 flex-wrap">
                {isRapid && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                        <Zap size={11} className="fill-white" /> Express 1-Hr
                    </span>
                )}

                {cat.includes('cancel') ? (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                        <XCircle size={11} /> Cancelled Order
                    </span>
                ) : cat.includes('replace') ? (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                        <RefreshCw size={11} /> Replacement
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
                        <RotateCcw size={11} /> Return &amp; Refund
                    </span>
                )}
            </div>
        );
    };

    // Helper: Return Status Badge
    const renderReturnStatusBadge = (status) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'REQUESTED':
                return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Pending Chemist Approval</span>;
            case 'APPROVED':
                return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">Pickup Approved</span>;
            case 'COLLECTEDBYDRIVER':
                return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">Collected by Driver</span>;
            case 'COMPLETED':
                return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">Return Verified</span>;
            case 'REJECTED':
                return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">Return Rejected</span>;
            default:
                return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{status || 'In Review'}</span>;
        }
    };

    return (
        <div className="space-y-6 text-left antialiased max-w-7xl mx-auto pb-14 select-none">
            <Toaster position="top-right" />

            {/* --- TOP HEADER --- */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                            <RotateCcw size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">
                                Cancelled &amp; Returned Orders
                            </h1>
                            <p className="text-xs text-slate-400 font-semibold">
                                Manage cancellation disputes, customer refund tickets, proof photos, and replacement requests.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
                        Total Records: <strong className="text-slate-900 font-mono">{totalRecords}</strong>
                    </span>
                    <button
                        onClick={fetchOrders}
                        title="Reload"
                        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* --- FILTER & SEARCH BAR --- */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Segment Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl w-full lg:w-auto overflow-x-auto">
                    {[
                        { label: 'All Cases', value: 'All' },
                        { label: 'Cancelled Orders', value: 'Cancelled' },
                        { label: 'Returns (Refund)', value: 'Return' },
                        { label: 'Replacements', value: 'Replacement' }
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => handleTabChange(tab.value)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                                selectedType === tab.value
                                    ? 'bg-white text-[#3d3f96] shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full lg:w-80">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* --- ORDERS LIST CONTENT --- */}
            {loading ? (
                <div className="min-h-[40vh] bg-white rounded-3xl border border-slate-200/80 p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <Loader2 size={36} className="animate-spin text-[#3d3f96]" />
                    <p className="text-xs font-bold uppercase tracking-wider">Loading Cancelled &amp; Return Ledger...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                        <Package size={28} />
                    </div>
                    <h3 className="text-sm font-black text-slate-800">No matching orders found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        There are no cancelled orders or return/replacement requests matching your current filter.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((item) => {
                        const {
                            orderId,
                            orderType,
                            category,
                            isRapid,
                            customer,
                            deliveryCity,
                            isCancelled,
                            cancelReason,
                            cancellationFeeApplied,
                            isReturn,
                            returnDetails,
                            totalAmount,
                            paymentMethod,
                            paymentStatus,
                            itemsSummary = [],
                            formattedDate
                        } = item;

                        return (
                            <div
                                key={item._id}
                                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-[#3d3f96]/30 transition space-y-4"
                            >
                                {/* Top Row: Order ID, Category, Timestamps, Navigate Button */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <button
                                            onClick={() => handleNavigateToDetail(item)}
                                            className="font-mono text-sm font-black text-slate-900 hover:text-[#3d3f96] hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            {orderId}
                                            <ExternalLink size={13} className="text-slate-400" />
                                        </button>
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                            {orderType || 'General'} Order
                                        </span>
                                        {renderCategoryBadge(category, isRapid)}
                                    </div>

                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1 justify-end">
                                                <Calendar size={11} /> {formattedDate || '—'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleNavigateToDetail(item)}
                                            className="px-3 py-1.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                                        >
                                            <Eye size={13} />
                                            <span>Full Details</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Middle Grid: Customer, Financials, Items Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                                    {/* Col 1: Customer Details (3 cols) */}
                                    <div className="md:col-span-3 space-y-1.5 border-r-0 md:border-r border-slate-100 md:pr-4">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                            <User size={11} /> Customer Profile
                                        </span>
                                        <p className="font-black text-slate-800 text-xs">{customer?.name || 'Customer'}</p>
                                        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                                            <Phone size={12} className="text-slate-400" />
                                            <a href={`tel:${customer?.phone}`} className="hover:text-[#3d3f96]">
                                                {customer?.phone || 'No phone'}
                                            </a>
                                        </div>
                                        {deliveryCity && (
                                            <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                                                <MapPin size={12} className="text-slate-400" />
                                                <span>{deliveryCity}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Col 2: Medicines / Items Summary (5 cols) */}
                                    <div className="md:col-span-5 space-y-1.5 border-r-0 md:border-r border-slate-100 md:pr-4">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                            <Package size={11} /> Products In Ticket ({itemsSummary.length})
                                        </span>
                                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                            {itemsSummary.map((med, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between py-0.5 text-slate-700 font-semibold"
                                                >
                                                    <span className="truncate pr-2 font-bold text-slate-800">• {med.name}</span>
                                                    <span className="font-mono text-slate-500 shrink-0">
                                                        x{med.quantity} (₹{med.price})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Col 3: Financials & Status (4 cols) */}
                                    <div className="md:col-span-4 space-y-1.5 pl-0 md:pl-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                            <CreditCard size={11} /> Financial Ledger
                                        </span>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-bold">Order Value:</span>
                                            <span className="font-mono font-black text-slate-900">₹{totalAmount || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400 font-semibold">Payment:</span>
                                            <span className="font-bold text-slate-700 uppercase">
                                                {paymentMethod} ({paymentStatus})
                                            </span>
                                        </div>
                                        {cancellationFeeApplied > 0 && (
                                            <div className="flex justify-between items-center text-rose-600 font-bold text-[11px]">
                                                <span>Penalty Deducted:</span>
                                                <span className="font-mono">₹{cancellationFeeApplied}</span>
                                            </div>
                                        )}
                                        {returnDetails?.refundAmount > 0 && (
                                            <div className="flex justify-between items-center text-emerald-600 font-bold text-[11px] pt-1 border-t border-slate-100">
                                                <span>Refund Value:</span>
                                                <span className="font-mono text-sm font-black">₹{returnDetails.refundAmount}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* BOTTOM SECTION: Cancel or Return Specific Breakdown */}
                                {isCancelled && (
                                    <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-800">
                                        <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-black uppercase tracking-wider text-[10px] text-rose-600 block">
                                                Cancellation Reason
                                            </span>
                                            <p className="font-semibold mt-0.5">
                                                {cancelReason || 'No specific cancellation reason provided.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isReturn && returnDetails && (
                                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-slate-800">
                                                    {returnDetails.requestType || 'Return'} Request Breakdown
                                                </span>
                                                {renderReturnStatusBadge(returnDetails.status)}
                                            </div>

                                            {returnDetails.pickupDriver ? (
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                                                    <Truck size={13} className="text-[#3d3f96]" />
                                                    <span>
                                                        Pickup Driver: {returnDetails.pickupDriver.name} ({returnDetails.pickupDriver.phone})
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    Pickup Driver: Not assigned yet
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                            {/* Reason & Comments */}
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                    Return Reason
                                                </span>
                                                <p className="font-bold text-slate-800">{returnDetails.reason || 'Not specified'}</p>
                                                {returnDetails.userComments && (
                                                    <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2 rounded-xl border border-slate-100">
                                                        "{returnDetails.userComments}"
                                                    </p>
                                                )}
                                                {returnDetails.rejectionReason && (
                                                    <div className="p-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[11px] font-bold mt-1">
                                                        Decline Reason: {returnDetails.rejectionReason}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Proof Images Gallery */}
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                                    <ImageIcon size={11} /> Proof Photos Uploaded by Customer
                                                </span>
                                                {returnDetails.proofImages && returnDetails.proofImages.length > 0 ? (
                                                    <div className="flex items-center gap-2 flex-wrap pt-1">
                                                        {returnDetails.proofImages.map((imgPath, imgIdx) => {
                                                            const fullUrl = getMediaUrl(imgPath);
                                                            return (
                                                                <button
                                                                    key={imgIdx}
                                                                    type="button"
                                                                    onClick={() => setPreviewImage(fullUrl)}
                                                                    className="group relative w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs hover:scale-105 transition cursor-pointer"
                                                                >
                                                                    <img
                                                                        src={fullUrl}
                                                                        alt={`Proof ${imgIdx + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                                                        <Eye size={12} />
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-[11px] text-slate-400 italic pt-1">
                                                        No damage proof photos attached.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* --- PAGINATION CONTROLS --- */}
                    {totalPages > 1 && (
                        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">
                                Page <strong className="text-slate-800">{currentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong>
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || loading}
                                    className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- PROOF IMAGE PREVIEW MODAL --- */}
            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-4 max-w-xl w-full border border-slate-100 shadow-2xl relative space-y-3 cursor-default"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                                <ImageIcon size={14} className="text-[#3d3f96]" /> Damaged / Proof Photo
                            </span>
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center max-h-[70vh]">
                            <img
                                src={previewImage}
                                alt="Damaged Item Proof"
                                className="max-h-[65vh] w-auto object-contain rounded-xl"
                            />
                        </div>

                        <div className="flex justify-end pt-1">
                            <a
                                href={previewImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-[#3d3f96] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                            >
                                <ExternalLink size={13} /> Open Full Size
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}