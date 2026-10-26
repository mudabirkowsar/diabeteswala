"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Pill,
    Calendar,
    Store,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Inbox,
    ChevronRight,
    ArrowRight,
    ReceiptText,
    Truck,
    Clock,
    Loader2,
    Sparkles,
    Star,
    ChevronLeft
} from 'lucide-react';

// API Service & Notification Context
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200";

const getMediaUrl = (path) => {
    if (!path) return PLACEHOLDER_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanBase = BASE_SERVER_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

const STATUS_TABS = ["All", "Placed", "Packed", "Shipped", "Delivered", "Cancelled"];

export default function PharmacyOrders() {
    const router = useRouter();
    const { showNotification } = useNotification();

    // --- State Management ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    // --- Fetch User's Pharmacy Orders ---
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
                page: currentPage,
                limit: 10
            };

            const response = await UserAPI.getUserPharmacyOrderHistory(params);
            if (response && response.success) {
                setOrders(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalOrders(response.totalOrders || 0);
            } else {
                if (showNotification) {
                    showNotification("Failed to load pharmacy orders.", "error");
                }
            }
        } catch (err) {
            console.error("Error retrieving pharmacy orders:", err);
            if (showNotification) {
                showNotification(err?.response?.data?.message || "Failed to retrieve medicine orders.", "error");
            }
        } finally {
            setLoading(false);
        }
    }, [statusFilter, currentPage, showNotification]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleTabChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    // --- Helper: Status Badge ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase() || 'PLACED';

        if (uppercase === 'DELIVERED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Delivered
                </span>
            );
        }
        if (uppercase === 'CANCELLED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-xs">
                    <AlertCircle size={12} className="text-rose-500" /> Cancelled
                </span>
            );
        }
        if (uppercase === 'SHIPPED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-xs animate-pulse">
                    <Truck size={12} className="text-amber-600" /> Shipped
                </span>
            );
        }
        if (uppercase === 'PACKED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 shadow-xs">
                    <Sparkles size={12} className="text-[#3d3f96]" /> Packed
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-200/60 shadow-xs">
                <Loader2 size={12} className="animate-spin text-[#3d3f96]" /> Placed
            </span>
        );
    };

    return (
        <div className="space-y-6 text-left select-none max-w-[1200px] mx-auto py-4 px-3 sm:px-6">
            {/* Header Section */}
            {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Pill className="text-[#3d3f96]" size={24} />
                        Pharmacy & Medicine Orders
                    </h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                        Track live prescriptions, OTC drugs, and scheduled delivery slots
                    </p>
                </div>
                <div className="text-xs font-black text-slate-500 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-xs self-start sm:self-auto">
                    Total Orders: <span className="text-[#3d3f96] font-mono">{totalOrders}</span>
                </div>
            </div> */}

            {/* Status Filter Tabs */}
            {/* <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {STATUS_TABS.map((status) => (
                    <button
                        key={status}
                        onClick={() => handleTabChange(status)}
                        className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                            statusFilter === status
                                ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/15'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div> */}

            {/* List / Loading / Empty States */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                        <Loader2 className="animate-spin text-[#3d3f96]" size={28} />
                    </div>
                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                        Scanning pharmacy registry...
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                        Fetching prescription ledgers and scheduled delivery windows
                    </p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 sm:p-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-inner">
                        <Inbox className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Medicine Orders Found</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm font-medium leading-relaxed">
                        {statusFilter !== "All"
                            ? `You have no pharmacy orders matching the filter "${statusFilter}".`
                            : "You haven't ordered any medications or healthcare supplements yet."}
                    </p>
                    <button
                        onClick={() => router.push('/pharmacy')}
                        className="mt-6 inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2e3075] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-950/10 cursor-pointer"
                    >
                        <span>Browse Pharmacy Store</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const pharmacy = order.pharmacy || {};
                        const pharmacyImg = getMediaUrl(pharmacy.image);
                        const isDelivered = order.status?.toUpperCase() === 'DELIVERED';
                        const isCancelled = order.status?.toUpperCase() === 'CANCELLED';

                        return (
                            <div
                                key={order._id}
                                className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group text-left relative overflow-hidden"
                            >
                                {/* Left status stripe */}
                                <div
                                    className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                                        isDelivered
                                            ? 'bg-emerald-500'
                                            : isCancelled
                                            ? 'bg-rose-500'
                                            : 'bg-[#3d3f96]'
                                    }`}
                                />

                                {/* 1. Main Pharmacy & Order Identity */}
                                <div className="flex items-center gap-4 min-w-0 flex-1 pl-2">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 shadow-xs">
                                        <img
                                            src={pharmacyImg}
                                            alt={pharmacy.name || "Pharmacy"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = PLACEHOLDER_IMAGE;
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[11px] font-black uppercase text-slate-800 font-mono tracking-wide">
                                                #{order.orderId}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                                                {order.orderType || 'General'}
                                            </span>
                                            {order.deliveryMode?.isRapid && (
                                                <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                                                    Rapid
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate group-hover:text-[#3d3f96] transition-colors flex items-center gap-1.5">
                                            {pharmacy.name || "Affiliated Partner Pharmacy"}
                                            {pharmacy.rating && (
                                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                                    <Star size={10} className="fill-amber-400 text-amber-400" />
                                                    {pharmacy.rating}
                                                </span>
                                            )}
                                        </h4>

                                        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} /> {order.formattedDate || new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                            {order.slotSchedule?.timeSlot && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 text-slate-600 font-bold">
                                                        <Clock size={12} className="text-[#3d3f96]" /> {order.slotSchedule.timeSlot}
                                                    </span>
                                                </>
                                            )}
                                            <span>•</span>
                                            <span>{order.collectionType || 'Home Delivery'}</span>
                                        </div>

                                        {/* Lightweight Items Peek */}
                                        {order.items && order.items.length > 0 && (
                                            <div className="text-[11px] text-slate-500 font-medium truncate max-w-lg">
                                                <strong className="text-slate-700 font-bold">Prescription: </strong>
                                                {order.items.map((it) => `${it.name} (${it.quantity})`).join(', ')}
                                                {order.itemsCount > order.items.length && ` + ${order.itemsCount - order.items.length} more`}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Middle: Status & Payable Amount */}
                                <div className="flex items-center justify-between lg:justify-center gap-6 border-t lg:border-t-0 lg:border-x border-slate-100 pt-3 lg:pt-0 lg:px-8 shrink-0">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">
                                            Order Status
                                        </span>
                                        <div>{renderStatusBadge(order.status)}</div>
                                    </div>

                                    <div className="space-y-0.5 text-right lg:text-left">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">
                                            Total Bill ({order.paymentInfo?.method || 'COD'})
                                        </span>
                                        <span className="font-mono font-black text-lg text-slate-900">
                                            ₹{order.billSummary?.totalAmount || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* 3. Right: Action Navigation */}
                                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/otherscreens/orders/pharmacyorderdetail/${order.orderId || order._id}`)}
                                        className="w-full sm:w-auto bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-[10px] font-black uppercase tracking-wider px-5 py-3 rounded-2xl shadow-md shadow-indigo-950/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <ReceiptText size={13} />
                                        <span>Track & Invoice</span>
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 px-2">
                            <span className="text-xs font-bold text-slate-400">
                                Page <strong className="text-slate-800">{currentPage}</strong> of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 flex items-center gap-1 shadow-xs hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 flex items-center gap-1 shadow-xs hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}